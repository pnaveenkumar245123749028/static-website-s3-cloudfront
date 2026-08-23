import mongoose from 'mongoose';
import { isDbConnected } from '../config/db.js';
import { inMemoryStore } from './inMemoryStore.js';

const executionLogSchema = new mongoose.Schema(
  {
    executionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Execution', required: true, index: true },
    workflowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true, index: true },
    nodeId: { type: String, default: null },
    nodeLabel: { type: String, default: null },
    agent: {
      type: String,
      enum: ['planner', 'execution', 'validation', 'recovery', 'monitoring', 'orchestrator'],
      required: true,
    },
    level: {
      type: String,
      enum: ['info', 'warning', 'error', 'success'],
      default: 'info',
    },
    eventType: { type: String, required: true },
    message: { type: String, required: true },
    payload: { type: Object, default: {} },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const MongooseExecutionLog = mongoose.models.ExecutionLog || mongoose.model('ExecutionLog', executionLogSchema);

export const ExecutionLogModel = {
  async create(data) {
    const logData = {
      ...data,
      timestamp: data.timestamp || new Date(),
    };
    if (isDbConnected()) {
      const doc = new MongooseExecutionLog(logData);
      await doc.save();
      return doc.toObject();
    }
    return inMemoryStore.insert('executionlogs', logData);
  },

  async find(query = {}, options = {}) {
    if (isDbConnected()) {
      let q = MongooseExecutionLog.find(query);
      if (options.sort) q = q.sort(options.sort);
      if (options.skip) q = q.skip(options.skip);
      if (options.limit) q = q.limit(options.limit);
      return q.lean();
    }
    return inMemoryStore.find('executionlogs', query, options);
  },

  async count(query = {}) {
    if (isDbConnected()) {
      return MongooseExecutionLog.countDocuments(query);
    }
    return inMemoryStore.count('executionlogs', query);
  },
};
