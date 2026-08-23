import mongoose from 'mongoose';
import { isDbConnected } from '../config/db.js';
import { inMemoryStore } from './inMemoryStore.js';

const integrationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    provider: {
      type: String,
      enum: ['gmail', 'slack', 'google-sheets', 'discord', 'openrouter', 'gemini'],
      required: true,
    },
    status: {
      type: String,
      enum: ['connected', 'disconnected', 'expired', 'error'],
      default: 'disconnected',
    },
    encryptedAccessToken: { type: String, default: null },
    encryptedRefreshToken: { type: String, default: null },
    encryptedApiKey: { type: String, default: null },
    scopes: { type: [String], default: [] },
    expiresAt: { type: Date, default: null },
    metadata: { type: Object, default: {} },
    errorMessage: { type: String, default: null },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

integrationSchema.index({ userId: 1, provider: 1 }, { unique: true });

const MongooseIntegration = mongoose.models.Integration || mongoose.model('Integration', integrationSchema);

export const IntegrationModel = {
  async upsert(userId, provider, data) {
    if (isDbConnected()) {
      return MongooseIntegration.findOneAndUpdate(
        { userId, provider },
        { ...data, userId, provider },
        { upsert: true, new: true }
      ).lean();
    }

    const existing = await inMemoryStore.findOne('integrations', { userId: userId.toString(), provider });
    if (existing) {
      return inMemoryStore.updateById('integrations', existing._id, data);
    }
    return inMemoryStore.insert('integrations', {
      userId: userId.toString(),
      provider,
      ...data,
      status: data.status || 'connected',
      enabled: data.enabled !== undefined ? data.enabled : true,
    });
  },

  async findByUserAndProvider(userId, provider) {
    if (isDbConnected()) {
      return MongooseIntegration.findOne({ userId, provider }).lean();
    }
    return inMemoryStore.findOne('integrations', { userId: userId.toString(), provider });
  },

  async findByUserId(userId) {
    if (isDbConnected()) {
      return MongooseIntegration.find({ userId }).lean();
    }
    return inMemoryStore.find('integrations', { userId: userId.toString() });
  },

  async delete(userId, provider) {
    if (isDbConnected()) {
      const res = await MongooseIntegration.findOneAndDelete({ userId, provider });
      return !!res;
    }
    const existing = await inMemoryStore.findOne('integrations', { userId: userId.toString(), provider });
    if (existing) {
      return inMemoryStore.deleteById('integrations', existing._id);
    }
    return false;
  },
};
