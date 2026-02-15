import { prisma } from '../../services/db';
import { auditService } from '../audit/audit.service';
import { eventEmitter } from '../realtime/emitter';
import { UpdateVolunteerInput, AssignVolunteerInput, UpdateResourceInput } from './logistics.schema';

// ─── Logistics Service ────────────────────────────────────────
// Manages volunteers (units), resources (inventory), and
// assignments. Every mutation creates an audit entry.
// ──────────────────────────────────────────────────────────────

export const logisticsService = {
  // ─── Volunteers ───────────────────────────────────────────
  async listVolunteers() {
    return prisma.volunteer.findMany({
      include: {
        assignments: {
          where: { status: 'ACTIVE' },
          include: {
            incident: { select: { id: true, type: true, locationName: true, severity: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  },

  async updateVolunteer(id: string, input: UpdateVolunteerInput, userId: string) {
    const volunteer = await prisma.volunteer.update({
      where: { id },
      data: input,
    });

    auditService.writeLog(userId, 'VOLUNTEER_UPDATED', 'Volunteer', id, input);
    eventEmitter.emit('unit.updated', volunteer);

    return volunteer;
  },

  // ─── Assignments ──────────────────────────────────────────
  async assignVolunteer(input: AssignVolunteerInput, assignedById: string) {
    // Verify volunteer exists and is AVAILABLE
    const volunteer = await prisma.volunteer.findUnique({ where: { id: input.volunteerId } });
    if (!volunteer) {
      throw Object.assign(new Error('Volunteer not found'), { statusCode: 404 });
    }
    if (volunteer.status === 'OFFLINE') {
      throw Object.assign(new Error('Cannot assign an offline volunteer'), { statusCode: 400 });
    }

    // Verify incident exists
    const incident = await prisma.incident.findUnique({ where: { id: input.incidentId } });
    if (!incident) {
      throw Object.assign(new Error('Incident not found'), { statusCode: 404 });
    }

    // Create assignment and update volunteer status in a transaction
    const [assignment] = await prisma.$transaction([
      prisma.assignment.create({
        data: {
          volunteerId: input.volunteerId,
          incidentId: input.incidentId,
          assignedById,
        },
        include: {
          volunteer: { select: { id: true, name: true } },
          incident: { select: { id: true, type: true, locationName: true } },
          assignedBy: { select: { id: true, name: true } },
        },
      }),
      prisma.volunteer.update({
        where: { id: input.volunteerId },
        data: {
          status: 'DEPLOYED',
          currentTaskId: input.incidentId,
        },
      }),
      // If incident was REPORTED, move to IN_PROGRESS
      ...(incident.status === 'REPORTED'
        ? [
            prisma.incident.update({
              where: { id: input.incidentId },
              data: { status: 'IN_PROGRESS' },
            }),
          ]
        : []),
    ]);

    auditService.writeLog(assignedById, 'VOLUNTEER_ASSIGNED', 'Assignment', assignment.id, {
      volunteerId: input.volunteerId,
      incidentId: input.incidentId,
    });
    eventEmitter.emit('assignment.created', assignment);

    return assignment;
  },

  // ─── Resources ────────────────────────────────────────────
  async listResources() {
    return prisma.resource.findMany({
      orderBy: { type: 'asc' },
    });
  },

  async updateResource(id: string, input: UpdateResourceInput, userId: string) {
    const resource = await prisma.resource.update({
      where: { id },
      data: input,
    });

    // Auto-detect status based on quantity
    if (input.quantity !== undefined) {
      let autoStatus = resource.status;
      if (input.quantity === 0) autoStatus = 'DEPLETED';
      else if (input.quantity < 10) autoStatus = 'LIMITED';
      else autoStatus = 'AVAILABLE';

      if (autoStatus !== resource.status) {
        await prisma.resource.update({
          where: { id },
          data: { status: autoStatus },
        });
      }
    }

    auditService.writeLog(userId, 'RESOURCE_UPDATED', 'Resource', id, input);
    eventEmitter.emit('resource.updated', resource);

    return resource;
  },
};
