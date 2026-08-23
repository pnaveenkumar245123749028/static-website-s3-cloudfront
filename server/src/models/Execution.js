import mongoose from 'mongoose';
import { isDbConnected } from '../config/db.js';
import { inMemoryStore } from './inMemoryStore.js';

const executionSchema = new mongoose.Schema(
  {
    workflowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workflowSnapshot: { type: Object, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING', 'PAUSED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    currentNodeId: { type: String, default: null },
    input: { type: Object, default: {} },
    output: { type: Object, default: {} },
    error: { type: Object, default: null },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    durationMs: { type: Number, default: 0 },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    pausedAt: { type: Date, default: null },
    orchestrationMetadata: {
      langGraph: { type: String, default: 'available' },
      planConfidence: { type: Number, default: 1.0 },
      plannedNodeCount: { type: Number, default: 0 },
      executedNodeCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const MongooseExecution = mongoose.models.Execution || mongoose.model('Execution', executionSchema);

export const ExecutionModel = {
  async create(data) {
    if (isDbConnected()) {
      const doc = new MongooseExecution(data);
      await doc.save();
      return doc.toObject();
    }
    return inMemoryStore.insert('executions', {
      ...data,
      status: data.status || 'PENDING',
      currentNodeId: null,
      input: data.input || {},
      output: {},
      error: null,
      retryCount: 0,
      maxRetries: data.maxRetries || 3,
      durationMs: 0,
      startedAt: data.startedAt || new Date(),
      completedAt: null,
      pausedAt: null,
      orchestrationMetadata: data.orchestrationMetadata || {
        langGraph: 'available',
        planConfidence: 1.0,
        plannedNodeCount: 0,
        executedNodeCount: 0,
      },
    });
  },

  async find(query = {}, options = {}) {
    if (isDbConnected()) {
      let q = MongooseExecution.find(query);
      if (options.sort) q = q.sort(options.sort);
      if (options.skip) q = q.skip(options.skip);
      if (options.limit) q = q.limit(options.limit);
      return q.lean();
    }
    return inMemoryStore.find('executions', query, options);
  },

  async findById(id) {
    if (isDbConnected()) {
      return MongooseExecution.findById(id).lean();
    }
    return inMemoryStore.findById('executions', id);
  },

  async updateById(id, update) {
    if (isDbConnected()) {
      return MongooseExecution.findByIdAndUpdate(id, update, { new: true }).lean();
    }
    return inMemoryStore.updateById('executions', id, update);
  },

  async count(query = {}) {
    if (isDbConnected()) {
      return MongooseExecution.countDocuments(query);
    }
    return inMemoryStore.count('executions', query);
  },
};
