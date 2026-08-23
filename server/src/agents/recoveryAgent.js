export class RecoveryAgent {
  constructor() {
    this.name = 'recovery';
  }

  classifyFailure(error) {
    const msg = (error.message || '').toUpperCase();
    const code = (error.code || '').toUpperCase();

    if (msg.includes('AUTH_EXPIRED') || msg.includes('401') || msg.includes('UNAUTHORIZED') || msg.includes('TOKEN') || msg.includes('INTEGRATION_NOT_CONNECTED')) {
      return 'AUTH_EXPIRED';
    }

    if (msg.includes('RATE_LIMIT') || msg.includes('429') || msg.includes('QUOTA') || code.includes('RATE_LIMIT')) {
      return 'RATE_LIMIT';
    }

    if (msg.includes('MISSING_FIELDS') || msg.includes('VALIDATION') || msg.includes('REQUIRED')) {
      return 'MISSING_FIELDS';
    }

    if (msg.includes('ECONNRESET') || msg.includes('ETIMEDOUT') || msg.includes('503') || msg.includes('502') || msg.includes('TIMEOUT')) {
      return 'TRANSIENT';
    }

    return 'API_FAILURE';
  }

  decideRecoveryAction(classification, currentRetryCount = 0, maxRetries = 3) {
    // Unrecoverable without user operator intervention
    if (classification === 'AUTH_EXPIRED') {
      return {
        action: 'escalate',
        reason: 'Authentication token is expired or integration is disconnected. Operator intervention required.',
        requiresOperatorAction: true,
        backoffDelayMs: 0,
        suggestedFix: 'Reconnect integration from the Integrations tab or refresh OAuth credentials.',
      };
    }

    if (classification === 'MISSING_FIELDS') {
      return {
        action: 'escalate',
        reason: 'Required node configuration fields are missing from step payload.',
        requiresOperatorAction: true,
        backoffDelayMs: 0,
        suggestedFix: 'Verify input template mapping in the Workflow Editor.',
      };
    }

    // Recoverable via Retry with Exponential Backoff
    if (currentRetryCount < maxRetries) {
      const baseDelay = classification === 'RATE_LIMIT' ? 2500 : 1000;
      const backoffDelayMs = baseDelay * Math.pow(2, currentRetryCount);

      return {
        action: 'retry_with_backoff',
        retryCount: currentRetryCount + 1,
        maxRetries,
        backoffDelayMs,
        reason: `Transient error classified as ${classification}. Performing automated backoff retry (${currentRetryCount + 1}/${maxRetries}).`,
        requiresOperatorAction: false,
      };
    }

    // Retries exhausted
    return {
      action: 'escalate',
      reason: `Maximum retries (${maxRetries}) exhausted for error ${classification}. Escalating execution failure to alert drawer.`,
      requiresOperatorAction: true,
      backoffDelayMs: 0,
      suggestedFix: 'Check target service uptime and review node parameters.',
    };
  }
}

export const recoveryAgent = new RecoveryAgent();
