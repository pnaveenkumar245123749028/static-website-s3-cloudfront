import mongoose from 'mongoose';
import { isDbConnected } from '../config/db.js';
import { inMemoryStore } from './inMemoryStore.js';

const agentMemorySchema = new mongoose.Schema(
  {
    workflowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', default: null, index: true },
    executionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Execution', default: null, index: true },
    agent: { type: String, required: true },
    key: { type: String, required: true },
    value: { type: Object, required: true },
    confidence: { type: Number, default: 1.0 },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

agentMemorySchema.index({ executionId: 1, agent: 1, key: 1 });

const MongooseAgentMemory = mongoose.models.AgentMemory || mongoose.model('AgentMemory', agentMemorySchema);

export const AgentMemoryModel = {
  async set(executionId, agent, key, value, confidence = 1.0, workflowId = null) {
    const data = {
      executionId,
      workflowId,
      agent,
      key,
      value,
      confidence,
    };
    if (isDbConnected()) {
      return MongooseAgentMemory.findOneAndUpdate(
        { executionId, agent, key },
        data,
        { upsert: true, new: true }
      ).lean();
    }
    const existing = await inMemoryStore.findOne('agentmemories', {
      executionId: executionId ? executionId.toString() : null,
      agent,
      key,
    });
    if (existing) {
      return inMemoryStore.updateById('agentmemories', existing._id, data);
    }
    return inMemoryStore.insert('agentmemories', data);
  },

  async get(executionId, agent, key) {
    if (isDbConnected()) {
      return MongooseAgentMemory.findOne({ executionId, agent, key }).lean();
    }
    return inMemoryStore.findOne('agentmemories', {
      executionId: executionId ? executionId.toString() : null,
      agent,
      key,
    });
  },

  async getAllForExecution(executionId) {
    if (isDbConnected()) {
      return MongooseAgentMemory.find({ executionId }).lean();
    }
    return inMemoryStore.find('agentmemories', {
      executionId: executionId ? executionId.toString() : null,
    });
  },
};
