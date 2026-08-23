import { AgentMemoryModel } from '../models/AgentMemory.js';

export const agentMemoryService = {
  async set(executionId, agent, key, value, confidence = 1.0, workflowId = null) {
    return AgentMemoryModel.set(executionId, agent, key, value, confidence, workflowId);
  },

  async get(executionId, agent, key) {
    return AgentMemoryModel.get(executionId, agent, key);
  },

  async getExecutionContext(executionId) {
    const entries = await AgentMemoryModel.getAllForExecution(executionId);
    const context = {};
    for (const entry of entries) {
      if (!context[entry.agent]) context[entry.agent] = {};
      context[entry.agent][entry.key] = {
        value: entry.value,
        confidence: entry.confidence,
        timestamp: entry.updatedAt || entry.createdAt,
      };
    }
    return context;
  },
};
