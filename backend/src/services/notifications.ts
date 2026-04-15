import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'booking'
  | 'task'
  | 'lead'
  | 'payment'
  | 'system'
  | 'mention'
  | 'invite';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown>;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
  actionLabel?: string;
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<Notification> {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      read: false,
      data: input.data || {},
      actionUrl: input.actionUrl,
      actionLabel: input.actionLabel,
    },
  });

  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type as NotificationType,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    data: notification.data as Record<string, unknown> | undefined,
    actionUrl: notification.actionUrl || undefined,
    actionLabel: notification.actionLabel || undefined,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
}

export async function createBulkNotifications(
  inputs: CreateNotificationInput[]
): Promise<Notification[]> {
  const notifications = await prisma.$transaction(
    inputs.map((input) =>
      prisma.notification.create({
        data: {
          userId: input.userId,
          type: input.type,
          title: input.title,
          message: input.message,
          read: false,
          data: input.data || {},
          actionUrl: input.actionUrl,
          actionLabel: input.actionLabel,
        },
      })
    )
  );

  return notifications.map((notification) => ({
    id: notification.id,
    userId: notification.userId,
    type: notification.type as NotificationType,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    data: notification.data as Record<string, unknown> | undefined,
    actionUrl: notification.actionUrl || undefined,
    actionLabel: notification.actionLabel || undefined,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  }));
}

export async function getUnreadNotifications(
  userId: string,
  limit: number = 50
): Promise<Notification[]> {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      read: false,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return notifications.map((notification) => ({
    id: notification.id,
    userId: notification.userId,
    type: notification.type as NotificationType,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    data: notification.data as Record<string, unknown> | undefined,
    actionUrl: notification.actionUrl || undefined,
    actionLabel: notification.actionLabel || undefined,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  }));
}

export async function getAllNotifications(
  userId: string,
  options?: {
    read?: boolean;
    type?: NotificationType;
    limit?: number;
    offset?: number;
  }
): Promise<{ notifications: Notification[]; total: number }> {
  const where: {
    userId: string;
    read?: boolean;
    type?: NotificationType;
  } = { userId };

  if (options?.read !== undefined) {
    where.read = options.read;
  }

  if (options?.type) {
    where.type = options.type;
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: options?.offset || 0,
      take: options?.limit || 50,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications: notifications.map((notification) => ({
      id: notification.id,
      userId: notification.userId,
      type: notification.type as NotificationType,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      data: notification.data as Record<string, unknown> | undefined,
      actionUrl: notification.actionUrl || undefined,
      actionLabel: notification.actionLabel || undefined,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    })),
    total,
  };
}

export async function markAsRead(notificationId: string): Promise<Notification> {
  const notification = await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });

  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type as NotificationType,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    data: notification.data as Record<string, unknown> | undefined,
    actionUrl: notification.actionUrl || undefined,
    actionLabel: notification.actionLabel || undefined,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
}

export async function markAllAsRead(userId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
    },
  });

  return result.count;
}

export async function markAsUnread(notificationId: string): Promise<Notification> {
  const notification = await prisma.notification.update({
    where: { id: notificationId },
    data: { read: false },
  });

  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type as NotificationType,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    data: notification.data as Record<string, unknown> | undefined,
    actionUrl: notification.actionUrl || undefined,
    actionLabel: notification.actionLabel || undefined,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
}

export async function deleteNotification(notificationId: string): Promise<void> {
  await prisma.notification.delete({
    where: { id: notificationId },
  });
}

export async function deleteOldNotifications(
  userId: string,
  olderThan: Date
): Promise<number> {
  const result = await prisma.notification.deleteMany({
    where: {
      userId,
      read: true,
      createdAt: {
        lt: olderThan,
      },
    },
  });

  return result.count;
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });
}

export async function getNotificationStats(
  userId: string
): Promise<{
  total: number;
  unread: number;
  byType: Record<string, number>;
}> {
  const [total, unread, byType] = await Promise.all([
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, read: false } }),
    prisma.notification.groupBy({
      by: ['type'],
      where: { userId },
      _count: { type: true },
    }),
  ]);

  const typeCounts: Record<string, number> = {};
  for (const stat of byType) {
    typeCounts[stat.type] = stat._count.type;
  }

  return { total, unread, byType: typeCounts };
}

export function createBookingNotification(
  userId: string,
  bookingTitle: string,
  scheduledTime: string,
  bookingId: string
): Promise<Notification> {
  return createNotification({
    userId,
    type: 'booking',
    title: 'New Booking Confirmed',
    message: `Your booking "${bookingTitle}" has been confirmed for ${new Date(
      scheduledTime
    ).toLocaleString()}.`,
    data: { bookingId, scheduledTime },
    actionUrl: `/bookings/${bookingId}`,
    actionLabel: 'View Booking',
  });
}

export function createTaskNotification(
  userId: string,
  taskTitle: string,
  taskId: string,
  assignerName: string
): Promise<Notification> {
  return createNotification({
    userId,
    type: 'task',
    title: 'New Task Assigned',
    message: `${assignerName} has assigned you a new task: "${taskTitle}"`,
    data: { taskId },
    actionUrl: `/tasks/${taskId}`,
    actionLabel: 'View Task',
  });
}

export function createLeadNotification(
  userId: string,
  leadName: string,
  leadId: string,
  leadEmail: string
): Promise<Notification> {
  return createNotification({
    userId,
    type: 'lead',
    title: 'New Lead Captured',
    message: `New lead from ${leadName} (${leadEmail})`,
    data: { leadId, leadEmail },
    actionUrl: `/leads/${leadId}`,
    actionLabel: 'View Lead',
  });
}

export function createPaymentNotification(
  userId: string,
  amount: number,
  currency: string,
  status: 'succeeded' | 'failed',
  invoiceId?: string
): Promise<Notification> {
  const isSuccess = status === 'succeeded';
  return createNotification({
    userId,
    type: 'payment',
    title: isSuccess ? 'Payment Successful' : 'Payment Failed',
    message: isSuccess
      ? `Your payment of ${amount} ${currency.toUpperCase()} was successful.`
      : `Your payment of ${amount} ${currency.toUpperCase()} failed. Please update your payment method.`,
    data: { amount, currency, status, invoiceId },
    actionUrl: invoiceId ? `/invoices/${invoiceId}` : '/billing',
    actionLabel: invoiceId ? 'View Invoice' : 'Update Billing',
  });
}

export function createSystemNotification(
  userId: string,
  title: string,
  message: string,
  severity: 'info' | 'warning' | 'error' = 'info'
): Promise<Notification> {
  const typeMap: Record<string, NotificationType> = {
    info: 'info',
    warning: 'warning',
    error: 'error',
  };

  return createNotification({
    userId,
    type: typeMap[severity],
    title,
    message,
    data: { severity },
  });
}
