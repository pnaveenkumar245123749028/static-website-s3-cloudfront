import mongoose from 'mongoose';
import { isDbConnected } from '../config/db.js';
import { inMemoryStore } from './inMemoryStore.js';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workflowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', default: null },
    executionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Execution', default: null },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error', 'escalation'],
      default: 'info',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

const MongooseNotification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export const NotificationModel = {
  async create(data) {
    if (isDbConnected()) {
      const doc = new MongooseNotification(data);
      await doc.save();
      return doc.toObject();
    }
    return inMemoryStore.insert('notifications', {
      ...data,
      read: false,
    });
  },

  async findByUserId(userId, options = {}) {
    if (isDbConnected()) {
      let q = MongooseNotification.find({ userId }).sort({ createdAt: -1 });
      if (options.limit) q = q.limit(options.limit);
      return q.lean();
    }
    return inMemoryStore.find('notifications', { userId: userId.toString() }, {
      sort: { createdAt: -1 },
      limit: options.limit || 50,
    });
  },

  async markAsRead(id, userId) {
    if (isDbConnected()) {
      return MongooseNotification.findOneAndUpdate(
        { _id: id, userId },
        { read: true },
        { new: true }
      ).lean();
    }
    return inMemoryStore.updateById('notifications', id, { read: true });
  },

  async markAllAsRead(userId) {
    if (isDbConnected()) {
      return MongooseNotification.updateMany({ userId, read: false }, { read: true });
    }
    const notifs = await inMemoryStore.find('notifications', { userId: userId.toString(), read: false });
    for (const notif of notifs) {
      await inMemoryStore.updateById('notifications', notif._id, { read: true });
    }
    return { modifiedCount: notifs.length };
  },
};
