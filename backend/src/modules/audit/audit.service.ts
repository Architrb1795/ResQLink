import { prisma } from '../../services/db';

// ─── Audit Service ────────────────────────────────────────────
// Provides immutable audit logging for every critical action.
// Every module calls auditService.writeLog() after mutations.
// ──────────────────────────────────────────────────────────────

export const auditService = {
  /**
   * Write an immutable audit log entry.
   */
  async writeLog(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata?: Record<string, unknown>
  ) {
    return prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        metadata: metadata as Parameters<typeof prisma.auditLog.create>[0]['data']['metadata'],
      },
    });
  },

  /**
   * Query audit logs with filters and pagination.
   */
  async queryLogs(filters: {
    userId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.startDate || filters.endDate) {
      where.timestamp = {
        ...(filters.startDate && { gte: filters.startDate }),
        ...(filters.endDate && { lte: filters.endDate }),
      };
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get all audit logs for a specific entity.
   */
  async getEntityLogs(entityType: string, entityId: string) {
    return prisma.auditLog.findMany({
      where: { entityType, entityId },
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { timestamp: 'desc' },
    });
  },
};
