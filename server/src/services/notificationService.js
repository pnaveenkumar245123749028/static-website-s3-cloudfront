import { NotificationModel } from '../models/Notification.js';
import { emitNotification } from '../config/socket.js';

export const notificationService = {
  async createNotification({ userId, workflowId, executionId, type = 'info', title, message, metadata = {} }) {
    const notification = await NotificationModel.create({
      userId,
      workflowId,
      executionId,
      type,
      title,
      message,
      metadata,
    });

    emitNotification(userId, notification);
    return notification;
  },

  async getUserNotifications(userId, limit = 50) {
    return NotificationModel.findByUserId(userId, { limit });
  },

  async markAsRead(notificationId, userId) {
    return NotificationModel.markAsRead(notificationId, userId);
  },

  async markAllAsRead(userId) {
    return NotificationModel.markAllAsRead(userId);
  },
};
