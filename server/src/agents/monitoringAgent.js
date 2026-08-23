import { ExecutionLogModel } from '../models/ExecutionLog.js';
import { emitAgentEvent, emitExecutionStatus } from '../config/socket.js';

export class MonitoringAgent {
  constructor() {
    this.name = 'monitoring';
  }

  async logAndEmit({ executionId, workflowId, nodeId = null, nodeLabel = null, agent, level = 'info', eventType, message, payload = {} }) {
    const logData = {
      executionId,
      workflowId,
      nodeId,
      nodeLabel,
      agent,
      level,
      eventType,
      message,
      payload,
      timestamp: new Date(),
    };

    // 1. Persist to MongoDB / In-memory execution log store
    const savedLog = await ExecutionLogModel.create(logData);

    // 2. Broadcast live event to Socket.IO clients subscribed to this execution
    emitAgentEvent(executionId, {
      ...savedLog,
      id: savedLog._id?.toString() || savedLog.id,
    });

    return savedLog;
  }

  emitStatusChange(executionId, statusData) {
    emitExecutionStatus(executionId, statusData);
  }
}

export const monitoringAgent = new MonitoringAgent();
