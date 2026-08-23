import { ExecutionModel } from '../models/Execution.js';
import { ExecutionLogModel } from '../models/ExecutionLog.js';
import { orchestrator } from '../agents/orchestrator.js';

export const executionService = {
  async listExecutions(userId, query = {}) {
    const filter = { userId: userId.toString() };
    if (query.status) filter.status = query.status;
    if (query.workflowId) filter.workflowId = query.workflowId;

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '50', 10);
    const skip = (page - 1) * limit;

    const executions = await ExecutionModel.find(filter, {
      sort: { createdAt: -1 },
      skip,
      limit,
    });
    const total = await ExecutionModel.count(filter);

    return {
      executions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async getExecutionById(executionId, userId) {
    const execution = await ExecutionModel.findById(executionId);
    if (!execution || execution.userId.toString() !== userId.toString()) {
      const error = new Error('Execution not found or access denied.');
      error.statusCode = 404;
      error.code = 'EXECUTION_NOT_FOUND';
      throw error;
    }
    return execution;
  },

  async getExecutionTimeline(executionId, userId) {
    const execution = await this.getExecutionById(executionId, userId);
    const logs = await ExecutionLogModel.find(
      { executionId: execution._id.toString() },
      { sort: { timestamp: 1 } }
    );

    return {
      execution,
      timeline: logs,
      totalEvents: logs.length,
    };
  },

  async pauseExecution(executionId, userId) {
    await this.getExecutionById(executionId, userId);
    const success = orchestrator.pause(executionId);
    return { success, message: success ? 'Execution paused.' : 'Execution is not currently running.' };
  },

  async resumeExecution(executionId, userId) {
    await this.getExecutionById(executionId, userId);
    const success = orchestrator.resume(executionId);
    return { success, message: success ? 'Execution resumed.' : 'Execution was not in paused state.' };
  },

  async cancelExecution(executionId, userId) {
    await this.getExecutionById(executionId, userId);
    const success = orchestrator.cancel(executionId);
    return { success, message: 'Execution cancelled.' };
  },
};
