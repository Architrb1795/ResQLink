import { Prisma } from '@prisma/client';
import { prisma } from '../../services/db';
import { auditService } from '../audit/audit.service';
import { CreateIncidentInput, ListIncidentsQuery, UpdateStatusInput } from './incident.schema';
import { eventEmitter } from '../realtime/emitter';
import { weatherService, WeatherData } from '../../services/weather';

// ─── Incident Service ─────────────────────────────────────────
// Core incident lifecycle: create, list, get, update status,
// verify, and vote. Every mutation writes an audit log and
// emits a real-time event.
//
// On creation, automatically fetches weather data and applies
// severity heuristics.
// ──────────────────────────────────────────────────────────────

export const incidentService = {
  async create(input: CreateIncidentInput, reporterId: string) {
    // Fetch weather data (non-blocking, best-effort)
    let weather: WeatherData | null = null;
    try {
      weather = await weatherService.getWeather(input.lat, input.lng);
    } catch (error) {
      console.error('[Incident] Weather fetch failed (non-critical):', error);
    }

    // Check if weather should affect severity
    let severity = input.severity;
    if (weather) {
      const impact = weatherService.assessWeatherImpact(input.type, weather);
      if (impact.shouldEscalate && severity !== 'CRITICAL') {
        const levels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
        const currentIdx = levels.indexOf(severity as typeof levels[number]);
        if (currentIdx < levels.length - 1) {
          severity = levels[currentIdx + 1];
          console.log(`[Incident] Severity escalated: ${input.severity} → ${severity} (${impact.reason})`);
        }
      }
    }

    const startData: Prisma.IncidentCreateInput = {
      ...input,
      severity,
      reporter: { connect: { id: reporterId } },
      weather: weather ? (weather as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
    };

    const incident = await prisma.incident.create({
      data: startData,
      include: {
        reporter: { select: { id: true, name: true, role: true } },
      } satisfies Prisma.IncidentInclude,
    });

    // Audit + real-time event (non-blocking)
    auditService.writeLog(reporterId, 'INCIDENT_CREATED', 'Incident', incident.id, {
      type: incident.type,
      severity: incident.severity,
      weatherAttached: !!weather,
    });
    eventEmitter.emit('incident.created', incident);

    return incident;
  },

  async list(query: ListIncidentsQuery) {
    const { page, limit, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.IncidentWhereInput = {};
    if (filters.type) where.type = filters.type;
    if (filters.severity) where.severity = filters.severity;
    if (filters.status) where.status = filters.status;

    const include = {
      reporter: { select: { id: true, name: true, role: true } },
      _count: { select: { assignments: true, media: true } },
    } satisfies Prisma.IncidentInclude;

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        include,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.incident.count({ where }),
    ]);

    return {
      incidents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string) {
    const include = {
      reporter: { select: { id: true, name: true, role: true } },
      assignments: {
        include: {
          volunteer: { select: { id: true, name: true, status: true } },
          assignedBy: { select: { id: true, name: true } },
        },
      },
      media: true,
      _count: { select: { assignments: true, media: true } },
    } satisfies Prisma.IncidentInclude;

    const incident = await prisma.incident.findUnique({
      where: { id },
      include,
    });

    if (!incident) {
      throw Object.assign(new Error('Incident not found'), { statusCode: 404 });
    }

    return incident;
  },

  async updateStatus(id: string, input: UpdateStatusInput, userId: string) {
    const incident = await prisma.incident.update({
      where: { id },
      data: { status: input.status },
      include: {
        reporter: { select: { id: true, name: true, role: true } },
      },
    });

    auditService.writeLog(userId, 'INCIDENT_STATUS_UPDATED', 'Incident', id, {
      newStatus: input.status,
    });
    eventEmitter.emit('incident.updated', incident);

    return incident;
  },

  async verify(id: string, userId: string) {
    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident) {
      throw Object.assign(new Error('Incident not found'), { statusCode: 404 });
    }

    const updated = await prisma.incident.update({
      where: { id },
      data: { verified: !incident.verified },
    });

    auditService.writeLog(userId, 'INCIDENT_VERIFIED', 'Incident', id, {
      verified: updated.verified,
    });
    eventEmitter.emit('incident.updated', updated);

    return updated;
  },

  async vote(id: string, userId: string) {
    const incident = await prisma.incident.update({
      where: { id },
      data: { votes: { increment: 1 } },
    });

    auditService.writeLog(userId, 'INCIDENT_VOTED', 'Incident', id);

    return incident;
  },
};
