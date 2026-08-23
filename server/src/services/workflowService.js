import { WorkflowModel } from '../models/Workflow.js';
import { ExecutionModel } from '../models/Execution.js';
import { ExecutionLogModel } from '../models/ExecutionLog.js';
import { aiGenerationService } from './aiGenerationService.js';
import { enqueueExecution } from '../queues/executionQueue.js';

export const workflowService = {
  async listUserWorkflows(userId, query = {}) {
    const filter = { userId: userId.toString() };
    if (query.status) filter.status = query.status;
    if (query.search) {
      filter.name = { $regex: query.search, $options: 'i' };
    }

    const sort = query.sort === 'asc' ? { createdAt: 1 } : { updatedAt: -1 };
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '50', 10);
    const skip = (page - 1) * limit;

    const workflows = await WorkflowModel.find(filter, { sort, skip, limit });
    const total = await WorkflowModel.count(filter);

    return {
      workflows,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async getWorkflowById(workflowId, userId) {
    const workflow = await WorkflowModel.findById(workflowId);
    if (!workflow || workflow.userId.toString() !== userId.toString()) {
      const error = new Error('Workflow not found or access denied.');
      error.statusCode = 404;
      error.code = 'WORKFLOW_NOT_FOUND';
      throw error;
    }
    return workflow;
  },

  async createWorkflow(userId, data) {
    if (!data.name) {
      const error = new Error('Workflow name is required.');
      error.statusCode = 400;
      throw error;
    }

    return WorkflowModel.create({
      ...data,
      userId,
      version: 1,
    });
  },

  async updateWorkflow(workflowId, userId, updateData) {
    await this.getWorkflowById(workflowId, userId);

    const updated = await WorkflowModel.updateById(workflowId, {
      ...updateData,
      $inc: { version: 1 },
    });

    return updated;
  },

  async duplicateWorkflow(workflowId, userId) {
    const original = await this.getWorkflowById(workflowId, userId);

    const duplicateData = {
      name: `${original.name} (Copy)`,
      description: original.description,
      userId,
      status: 'draft',
      trigger: original.trigger,
      nodes: original.nodes,
      edges: original.edges,
      version: 1,
      tags: [...(original.tags || []), 'cloned'],
    };

    return WorkflowModel.create(duplicateData);
  },

  async deleteWorkflow(workflowId, userId) {
    await this.getWorkflowById(workflowId, userId);
    return WorkflowModel.deleteById(workflowId);
  },

  async generateWorkflow(userId, prompt) {
    const generated = await aiGenerationService.generateWorkflowFromPrompt(prompt, userId);
    return generated;
  },

  async executeWorkflow(workflowId, userId, input = {}) {
    const workflow = await this.getWorkflowById(workflowId, userId);

    if (!workflow.nodes || workflow.nodes.length === 0) {
      const err = new Error('Cannot execute workflow with 0 nodes.');
      err.statusCode = 400;
      throw err;
    }

    // Create execution session document
    const execution = await ExecutionModel.create({
      workflowId,
      userId,
      workflowSnapshot: workflow,
      status: 'PENDING',
      input: input || {},
      startedAt: new Date(),
    });

    // Enqueue to background queue
    await enqueueExecution(execution._id.toString(), userId);

    return execution;
  },

  async getDashboardMetrics(userId) {
    const userFilter = { userId: userId.toString() };
    const totalWorkflows = await WorkflowModel.count(userFilter);
    const activeWorkflows = await WorkflowModel.count({ ...userFilter, status: 'active' });
    const pausedWorkflows = await WorkflowModel.count({ ...userFilter, status: 'paused' });
    const draftWorkflows = await WorkflowModel.count({ ...userFilter, status: 'draft' });

    const allWorkflows = await WorkflowModel.find(userFilter, { sort: { updatedAt: -1 }, limit: 10 });
    const recentExecutions = await ExecutionModel.find(userFilter, { sort: { createdAt: -1 }, limit: 10 });

    const totalExecutions = await ExecutionModel.count(userFilter);
    const completedExecutions = await ExecutionModel.count({ ...userFilter, status: 'COMPLETED' });
    const failedExecutions = await ExecutionModel.count({ ...userFilter, status: 'FAILED' });
    const runningExecutions = await ExecutionModel.count({ ...userFilter, status: 'RUNNING' });

    const successRate = totalExecutions > 0 ? ((completedExecutions / totalExecutions) * 100).toFixed(1) : '100.0';

    // Recent AI reasoning events
    const recentAiLogs = await ExecutionLogModel.find(
      { agent: { $in: ['planner', 'recovery', 'validation', 'execution'] } },
      { sort: { timestamp: -1 }, limit: 12 }
    );

    return {
      metrics: {
        totalWorkflows,
        activeWorkflows,
        pausedWorkflows,
        draftWorkflows,
        totalExecutions,
        completedExecutions,
        failedExecutions,
        runningExecutions,
        successRate: parseFloat(successRate),
      },
      recentWorkflows: allWorkflows,
      recentExecutions,
      recentAiLogs,
    };
  },
};
