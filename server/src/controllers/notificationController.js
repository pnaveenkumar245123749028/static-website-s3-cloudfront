import { notificationService } from '../services/notificationService.js';

export const notificationController = {
  async list(req, res, next) {
    try {
      const limit = parseInt(req.query.limit || '50', 10);
      const notifications = await notificationService.getUserNotifications(req.user.id, limit);
      res.status(200).json({ success: true, data: { notifications } });
    } catch (err) {
      next(err);
    }
  },

  async markRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.user.id);
      res.status(200).json({ success: true, data: { notification } });
    } catch (err) {
      next(err);
    }
  },

  async markAllRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user.id);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
};
