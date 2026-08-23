import mongoose from 'mongoose';
import { isDbConnected } from '../config/db.js';
import { inMemoryStore } from './inMemoryStore.js';

const workflowSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'archived'],
      default: 'active',
    },
    trigger: {
      type: { type: String, default: 'manual' },
      config: { type: Object, default: {} },
    },
    nodes: { type: Array, default: [] },
    edges: { type: Array, default: [] },
    version: { type: Number, default: 1 },
    tags: { type: [String], default: [] },
    lastExecution: { type: Date, default: null },
    executionCount: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const MongooseWorkflow = mongoose.models.Workflow || mongoose.model('Workflow', workflowSchema);

export const WorkflowModel = {
  async create(data) {
    if (isDbConnected()) {
      const doc = new MongooseWorkflow(data);
      await doc.save();
      return doc.toObject();
    }
    return inMemoryStore.insert('workflows', {
      ...data,
      status: data.status || 'active',
      trigger: data.trigger || { type: 'manual', config: {} },
      nodes: data.nodes || [],
      edges: data.edges || [],
      version: data.version || 1,
      tags: data.tags || [],
      lastExecution: null,
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
    });
  },

  async find(query = {}, options = {}) {
    if (isDbConnected()) {
      let q = MongooseWorkflow.find(query);
      if (options.sort) q = q.sort(options.sort);
      if (options.skip) q = q.skip(options.skip);
      if (options.limit) q = q.limit(options.limit);
      return q.lean();
    }
    return inMemoryStore.find('workflows', query, options);
  },

  async findById(id) {
    if (isDbConnected()) {
      return MongooseWorkflow.findById(id).lean();
    }
    return inMemoryStore.findById('workflows', id);
  },

  async updateById(id, update) {
    if (isDbConnected()) {
      return MongooseWorkflow.findByIdAndUpdate(id, update, { new: true }).lean();
    }
    return inMemoryStore.updateById('workflows', id, update);
  },

  async deleteById(id) {
    if (isDbConnected()) {
      const res = await MongooseWorkflow.findByIdAndDelete(id);
      return !!res;
    }
    return inMemoryStore.deleteById('workflows', id);
  },

  async count(query = {}) {
    if (isDbConnected()) {
      return MongooseWorkflow.countDocuments(query);
    }
    return inMemoryStore.count('workflows', query);
  },
};
