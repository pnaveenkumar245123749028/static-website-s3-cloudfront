export class ValidationAgent {
  constructor() {
    this.name = 'validation';
  }

  async validate(step, executionResult) {
    const { output, provider, action } = executionResult;

    if (!output || typeof output !== 'object') {
      return {
        valid: false,
        error: 'Output must be a non-null object.',
        errorCode: 'EMPTY_OUTPUT',
        validationDetails: { receivedType: typeof output },
      };
    }

    // Provider-specific validation rules
    if (provider === 'gmail') {
      if (action.includes('send') && !output.messageId && !output.status) {
        return {
          valid: false,
          error: 'Gmail send action did not return a valid messageId or delivery confirmation status.',
          errorCode: 'MISSING_FIELDS',
          validationDetails: { expected: ['messageId', 'status'], got: Object.keys(output) },
        };
      }
    }

    if (provider === 'slack') {
      if (!output.ts && !output.status) {
        return {
          valid: false,
          error: 'Slack message post did not return a timestamp or delivery status.',
          errorCode: 'MISSING_FIELDS',
          validationDetails: { expected: ['ts', 'status'], got: Object.keys(output) },
        };
      }
    }

    if (provider === 'google-sheets') {
      if (action.includes('append') && output.updatedRows === undefined && !output.updatedRange && !output.appendedRow) {
        return {
          valid: false,
          error: 'Google Sheets append did not return row update confirmation.',
          errorCode: 'MISSING_FIELDS',
          validationDetails: { expected: ['updatedRows', 'appendedRow'], got: Object.keys(output) },
        };
      }
    }

    if (provider === 'openrouter' || provider === 'gemini') {
      if (!output.text && !output.summary) {
        return {
          valid: false,
          error: 'AI reasoning step returned an empty response.',
          errorCode: 'MISSING_FIELDS',
          validationDetails: { expected: ['text', 'summary'], got: Object.keys(output) },
        };
      }
    }

    return {
      valid: true,
      validatedFields: Object.keys(output),
      confidence: 1.0,
      timestamp: new Date().toISOString(),
    };
  }
}

export const validationAgent = new ValidationAgent();
