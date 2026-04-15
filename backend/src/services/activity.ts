import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type ActivityType =
  | 'user.login'
  | 'user.logout'
  | 'user.created'
  | 'user.updated'
  | 'user.password_reset'
  | 'booking.created'
  | 'booking.updated'
  | 'booking.cancelled'
  | 'booking.completed'
  | 'task.created'
  | 'task.updated'
  | 'task.assigned'
  | 'task.completed'
  | 'task.deleted'
  | 'lead.created'
  | 'lead.updated'
  | 'lead.converted'
  | 'lead.deleted'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.cancelled'
  | 'subscription.renewed'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'invoice.generated'
  | 'invoice.paid'
  | 'settings.updated'
  | 'integration.connected'
  | 'integration.disconnected'
  | 'api.error'
  | 'system.maintenance';

export interface ActivityMetadata {
  [key: string]: unknown;
}

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  description: string;
  metadata?: ActivityMetadata;
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export async function logActivity(
  userId: string,
  type: ActivityType,
  description: string,
  metadata?: ActivityMetadata,
  options?: {
    entityType?: string;
    entityId?: string;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<Activity> {
  const activity = await prisma.activity.create({
    data: {
      userId,
      type,
      description,
      metadata: metadata || {},
      entityType: options?.entityType,
      entityId: options?.entityId,
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
    },
  });

  return {
    id: activity.id,
    userId: activity.userId,
    type: activity.type as ActivityType,
    description: activity.description,
    metadata: activity.metadata as ActivityMetadata,
    entityType: activity.entityType || undefined,
    entityId: activity.entityId || undefined,
    ipAddress: activity.ipAddress || undefined,
    userAgent: activity.userAgent || undefined,
    createdAt: activity.createdAt,
  };
}

export async function getRecentActivities(
  userId: string,
  limit: number = 50
): Promise<Activity[]> {
  const activities = await prisma.activity.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return activities.map((activity) => ({
    id: activity.id,
    userId: activity.userId,
    type: activity.type as ActivityType,
    description: activity.description,
    metadata: activity.metadata as ActivityMetadata,
    entityType: activity.entityType || undefined,
    entityId: activity.entityId || undefined,
    ipAddress: activity.ipAddress || undefined,
    userAgent: activity.userAgent || undefined,
    createdAt: activity.createdAt,
  }));
}

export async function getActivityFeed(
  entityType: string,
  entityId: string,
  limit: number = 50
): Promise<Activity[]> {
  const activities = await prisma.activity.findMany({
    where: {
      entityType,
      entityId,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return activities.map((activity) => ({
    id: activity.id,
    userId: activity.userId,
    type: activity.type as ActivityType,
    description: activity.description,
    metadata: activity.metadata as ActivityMetadata,
    entityType: activity.entityType || undefined,
    entityId: activity.entityId || undefined,
    ipAddress: activity.ipAddress || undefined,
    userAgent: activity.userAgent || undefined,
    createdAt: activity.createdAt,
  }));
}

export async function getActivitiesByType(
  userId: string,
  type: ActivityType,
  limit: number = 50
): Promise<Activity[]> {
  const activities = await prisma.activity.findMany({
    where: {
      userId,
      type,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return activities.map((activity) => ({
    id: activity.id,
    userId: activity.userId,
    type: activity.type as ActivityType,
    description: activity.description,
    metadata: activity.metadata as ActivityMetadata,
    entityType: activity.entityType || undefined,
    entityId: activity.entityId || undefined,
    ipAddress: activity.ipAddress || undefined,
    userAgent: activity.userAgent || undefined,
    createdAt: activity.createdAt,
  }));
}

export async function getActivitiesByTimeRange(
  userId: string,
  startTime: Date,
  endTime: Date,
  limit: number = 100
): Promise<Activity[]> {
  const activities = await prisma.activity.findMany({
    where: {
      userId,
      createdAt: {
        gte: startTime,
        lte: endTime,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return activities.map((activity) => ({
    id: activity.id,
    userId: activity.userId,
    type: activity.type as ActivityType,
    description: activity.description,
    metadata: activity.metadata as ActivityMetadata,
    entityType: activity.entityType || undefined,
    entityId: activity.entityId || undefined,
    ipAddress: activity.ipAddress || undefined,
    userAgent: activity.userAgent || undefined,
    createdAt: activity.createdAt,
  }));
}

export async function searchActivities(
  userId: string,
  query: string,
  limit: number = 50
): Promise<Activity[]> {
  const activities = await prisma.activity.findMany({
    where: {
      userId,
      OR: [
        { description: { contains: query, mode: 'insensitive' } },
        { type: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return activities.map((activity) => ({
    id: activity.id,
    userId: activity.userId,
    type: activity.type as ActivityType,
    description: activity.description,
    metadata: activity.metadata as ActivityMetadata,
    entityType: activity.entityType || undefined,
    entityId: activity.entityId || undefined,
    ipAddress: activity.ipAddress || undefined,
    userAgent: activity.userAgent || undefined,
    createdAt: activity.createdAt,
  }));
}

export async function getActivityStats(
  userId: string,
  startTime: Date,
  endTime: Date
): Promise<{
  total: number;
  byType: Record<string, number>;
}> {
  const stats = await prisma.activity.groupBy({
    by: ['type'],
    where: {
      userId,
      createdAt: {
        gte: startTime,
        lte: endTime,
      },
    },
    _count: {
      type: true,
    },
  });

  const byType: Record<string, number> = {};
  let total = 0;

  for (const stat of stats) {
    byType[stat.type] = stat._count.type;
    total += stat._count.type;
  }

  return { total, byType };
}

export async function deleteOldActivities(
  before: Date,
  batchSize: number = 1000
): Promise<number> {
  let deleted = 0;

  while (true) {
    const activities = await prisma.activity.findMany({
      where: {
        createdAt: {
          lt: before,
        },
      },
      take: batchSize,
      select: { id: true },
    });

    if (activities.length === 0) break;

    const result = await prisma.activity.deleteMany({
      where: {
        id: {
          in: activities.map((a) => a.id),
        },
      },
    });

    deleted += result.count;

    if (activities.length < batchSize) break;
  }

  return deleted;
}
