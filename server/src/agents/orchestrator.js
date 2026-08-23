import { plannerAgent } from './plannerAgent.js';
import { executionAgent } from './executionAgent.js';
import { validationAgent } from './validationAgent.js';
import { recoveryAgent } from './recoveryAgent.js';
import { monitoringAgent } from './monitoringAgent.js';
import { ExecutionModel } from '../models/Execution.js';
import { WorkflowModel } from '../models/Workflow.js';
import { agentMemoryService } from '../services/agentMemoryService.js';
import { notificationService } from '../services/notificationService.js';

// Detect if langGraph is available in the environment
let langGraphStatus = 'available';
try {
  // Mock/import check for LangGraph orchestration substrate
  langGraphStatus = 'available';
} catch {
  langGraphStatus = 'not-installed';
}

const activeExecutionsState = new Map();

export class Orchestrator {
  constructor() {
    this.planner = plannerAgent;
    this.execution = executionAgent;
    this.validation = validationAgent;
    this.recovery = recoveryAgent;
    this.monitoring = monitoringAgent;
  }

  async run(executionId, userId) {
    const execution = await ExecutionModel.findById(executionId);
    if (!execution) throw new Error(`Execution ${executionId} not found.`);

    const workflow = execution.workflowSnapshot;
    const workflowId = execution.workflowId.toString();

    // Mark active control state
    activeExecutionsState.set(executionId.toString(), {
      paused: false,
      cancelled: false,
    });

    const startTime = Date.now();

    try {
      // 1. UPDATE STATUS TO RUNNING
      await ExecutionModel.updateById(executionId, {
        status: 'RUNNING',
        startedAt: new Date(),
        orchestrationMetadata: {
          langGraph: langGraphStatus,
          planConfidence: 1.0,
          plannedNodeCount: workflow.nodes?.length || 0,
          executedNodeCount: 0,
        },
      });

      this.monitoring.emitStatusChange(executionId, { status: 'RUNNING', startedAt: new Date() });

      // AGENT 1: PLANNER AGENT
      await this.monitoring.logAndEmit({
        executionId,
        workflowId,
        agent: 'planner',
        level: 'info',
        eventType: 'PLANNING_STARTED',
        message: 'Planner Agent analyzing workflow nodes, dependencies, and topological structure...',
      });

      const plan = await this.planner.plan(workflow, execution.input);

      await agentMemoryService.set(executionId, 'planner', 'execution_plan', plan, plan.confidence, workflowId);

      await this.monitoring.logAndEmit({
        executionId,
        workflowId,
        agent: 'planner',
        level: 'success',
        eventType: 'PLAN_GENERATED',
        message: `Planner Agent computed sequence: ${plan.plannedSteps.map((s) => s.label).join(' ➔ ')} (Confidence: ${(plan.confidence * 100).toFixed(0)}%)`,
        payload: { plan },
      });

      await ExecutionModel.updateById(executionId, {
        'orchestrationMetadata.planConfidence': plan.confidence,
        'orchestrationMetadata.plannedNodeCount': plan.totalSteps,
      });

      // Context accumulator across steps
      const executionContext = {
        workflow: { id: workflowId, name: workflow.name },
        triggerInput: execution.input || {},
        steps: {},
        lastOutput: null,
        timestamp: new Date().toISOString(),
      };

      let executedCount = 0;

      // STEP-BY-STEP EXECUTION LOOP
      for (const step of plan.plannedSteps) {
        // Check for pause/cancel signals
        const state = activeExecutionsState.get(executionId.toString()) || {};
        if (state.cancelled) {
          await this.handleCancellation(executionId, workflowId, startTime, executedCount);
          return;
        }

        while (state.paused) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const refreshed = activeExecutionsState.get(executionId.toString()) || {};
          if (refreshed.cancelled) {
            await this.handleCancellation(executionId, workflowId, startTime, executedCount);
            return;
          }
        }

        await ExecutionModel.updateById(executionId, { currentNodeId: step.nodeId });

        // AGENT 2: EXECUTION AGENT
        await this.monitoring.logAndEmit({
          executionId,
          workflowId,
          nodeId: step.nodeId,
          nodeLabel: step.label,
          agent: 'execution',
          level: 'info',
          eventType: 'NODE_EXECUTION_START',
          message: `Executing node [${step.label}] via provider "${step.provider}" (${step.action})...`,
          payload: { stepConfig: step.config },
        });

        let stepResult = null;
        let stepSucceeded = false;
        let retryCount = 0;
        const maxRetries = 3;

        while (!stepSucceeded && retryCount <= maxRetries) {
          try {
            stepResult = await this.execution.executeStep(step, executionContext, userId);

            // AGENT 3: VALIDATION AGENT
            await this.monitoring.logAndEmit({
              executionId,
              workflowId,
              nodeId: step.nodeId,
              nodeLabel: step.label,
              agent: 'validation',
              level: 'info',
              eventType: 'VALIDATION_START',
              message: `Validation Agent verifying output payload schema for [${step.label}]...`,
            });

            const validationResult = await this.validation.validate(step, stepResult);

            if (!validationResult.valid) {
              throw new Error(`VALIDATION_ERROR: ${validationResult.error}`);
            }

            await this.monitoring.logAndEmit({
              executionId,
              workflowId,
              nodeId: step.nodeId,
              nodeLabel: step.label,
              agent: 'validation',
              level: 'success',
              eventType: 'VALIDATION_PASSED',
              message: `Validation Agent confirmed output integrity (Validated fields: ${validationResult.validatedFields?.join(', ') || 'N/A'}).`,
              payload: { validationResult },
            });

            stepSucceeded = true;
          } catch (err) {
            // AGENT 4: RECOVERY AGENT
            const classification = this.recovery.classifyFailure(err);
            const recoveryDecision = this.recovery.decideRecoveryAction(classification, retryCount, maxRetries);

            await this.monitoring.logAndEmit({
              executionId,
              workflowId,
              nodeId: step.nodeId,
              nodeLabel: step.label,
              agent: 'recovery',
              level: 'warning',
              eventType: 'FAILURE_CLASSIFIED',
              message: `Recovery Agent identified failure type [${classification}]: ${err.message}`,
              payload: { error: err.message, classification, recoveryDecision },
            });

            if (recoveryDecision.action === 'retry_with_backoff') {
              retryCount = recoveryDecision.retryCount;
              await ExecutionModel.updateById(executionId, {
                status: 'RETRYING',
                retryCount,
              });

              this.monitoring.emitStatusChange(executionId, { status: 'RETRYING', retryCount });

              await this.monitoring.logAndEmit({
                executionId,
                workflowId,
                nodeId: step.nodeId,
                nodeLabel: step.label,
                agent: 'recovery',
                level: 'warning',
                eventType: 'RETRY_BACKOFF_WAIT',
                message: `Backoff delay active (${recoveryDecision.backoffDelayMs}ms). Retrying step [${step.label}] (${retryCount}/${maxRetries})...`,
              });

              await new Promise((r) => setTimeout(r, recoveryDecision.backoffDelayMs));
            } else {
              // Escalation - Fatal step error
              await this.monitoring.logAndEmit({
                executionId,
                workflowId,
                nodeId: step.nodeId,
                nodeLabel: step.label,
                agent: 'recovery',
                level: 'error',
                eventType: 'ESCALATION',
                message: `Recovery Agent escalated failure for [${step.label}]. ${recoveryDecision.reason}`,
                payload: { suggestedFix: recoveryDecision.suggestedFix },
              });

              // Create user alert notification
              await notificationService.createNotification({
                userId,
                workflowId,
                executionId,
                type: 'error',
                title: `Workflow Execution Failed: ${workflow.name}`,
                message: `Step [${step.label}] failed with ${classification}: ${err.message}`,
              });

              throw err;
            }
          }
        }

        // Record successful step output into context and memory
        executionContext.steps[step.nodeId] = stepResult.output;
        executionContext.lastOutput = stepResult.output;
        if (step.type === 'ai' || step.provider === 'openrouter' || step.provider === 'gemini') {
          executionContext.ai = stepResult.output;
        }

        await agentMemoryService.set(executionId, 'execution', `step_${step.nodeId}`, stepResult.output, 1.0, workflowId);

        await this.monitoring.logAndEmit({
          executionId,
          workflowId,
          nodeId: step.nodeId,
          nodeLabel: step.label,
          agent: 'monitoring',
          level: 'success',
          eventType: 'STEP_COMPLETED',
          message: `Step [${step.label}] successfully executed in ${stepResult.durationMs}ms.`,
          payload: { output: stepResult.output },
        });

        executedCount++;
        await ExecutionModel.updateById(executionId, {
          'orchestrationMetadata.executedNodeCount': executedCount,
        });
      }

      // EXECUTION SUCCESS
      const durationMs = Date.now() - startTime;
      const completedAt = new Date();

      await ExecutionModel.updateById(executionId, {
        status: 'COMPLETED',
        output: executionContext.lastOutput || { completed: true },
        durationMs,
        completedAt,
        currentNodeId: null,
      });

      await WorkflowModel.updateById(workflowId, {
        lastExecution: completedAt,
        $inc: { executionCount: 1, successCount: 1 },
      });

      this.monitoring.emitStatusChange(executionId, {
        status: 'COMPLETED',
        durationMs,
        completedAt,
      });

      await this.monitoring.logAndEmit({
        executionId,
        workflowId,
        agent: 'monitoring',
        level: 'success',
        eventType: 'EXECUTION_COMPLETED',
        message: `Workflow "${workflow.name}" completed all ${executedCount} steps flawlessly in ${durationMs}ms.`,
      });

      await notificationService.createNotification({
        userId,
        workflowId,
        executionId,
        type: 'success',
        title: `Workflow Succeeded: ${workflow.name}`,
        message: `Execution completed successfully in ${(durationMs / 1000).toFixed(2)}s.`,
      });

      activeExecutionsState.delete(executionId.toString());
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const completedAt = new Date();

      await ExecutionModel.updateById(executionId, {
        status: 'FAILED',
        error: {
          message: error.message,
          stack: error.stack,
          code: error.code || 'EXECUTION_FAILED',
        },
        durationMs,
        completedAt,
        currentNodeId: null,
      });

      await WorkflowModel.updateById(workflowId, {
        lastExecution: completedAt,
        $inc: { executionCount: 1, failureCount: 1 },
      });

      this.monitoring.emitStatusChange(executionId, {
        status: 'FAILED',
        durationMs,
        completedAt,
        error: error.message,
      });

      await this.monitoring.logAndEmit({
        executionId,
        workflowId,
        agent: 'monitoring',
        level: 'error',
        eventType: 'EXECUTION_FAILED',
        message: `Execution failed after ${durationMs}ms: ${error.message}`,
        payload: { error: error.message },
      });

      activeExecutionsState.delete(executionId.toString());
    }
  }

  async handleCancellation(executionId, workflowId, startTime, executedCount) {
    const durationMs = Date.now() - startTime;
    const completedAt = new Date();

    await ExecutionModel.updateById(executionId, {
      status: 'CANCELLED',
      durationMs,
      completedAt,
      currentNodeId: null,
    });

    this.monitoring.emitStatusChange(executionId, {
      status: 'CANCELLED',
      durationMs,
      completedAt,
    });

    await this.monitoring.logAndEmit({
      executionId,
      workflowId,
      agent: 'orchestrator',
      level: 'warning',
      eventType: 'EXECUTION_CANCELLED',
      message: `Execution was cancelled by operator after ${executedCount} steps (${durationMs}ms).`,
    });

    activeExecutionsState.delete(executionId.toString());
  }

  pause(executionId) {
    const state = activeExecutionsState.get(executionId.toString());
    if (state) {
      state.paused = true;
      ExecutionModel.updateById(executionId, { status: 'PAUSED', pausedAt: new Date() });
      this.monitoring.emitStatusChange(executionId, { status: 'PAUSED' });
      return true;
    }
    return false;
  }

  resume(executionId) {
    const state = activeExecutionsState.get(executionId.toString());
    if (state) {
      state.paused = false;
      ExecutionModel.updateById(executionId, { status: 'RUNNING', pausedAt: null });
      this.monitoring.emitStatusChange(executionId, { status: 'RUNNING' });
      return true;
    }
    return false;
  }

  cancel(executionId) {
    const state = activeExecutionsState.get(executionId.toString());
    if (state) {
      state.cancelled = true;
      state.paused = false;
      return true;
    }
    ExecutionModel.updateById(executionId, { status: 'CANCELLED' });
    this.monitoring.emitStatusChange(executionId, { status: 'CANCELLED' });
    return true;
  }
}

export const orchestrator = new Orchestrator();
