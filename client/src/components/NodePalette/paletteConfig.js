export const PALETTE_CATEGORIES = [
  {
    category: 'trigger',
    title: 'Triggers',
    color: 'emerald',
    items: [
      {
        provider: 'webhook',
        name: 'Webhook Trigger',
        category: 'trigger',
        defaultAction: 'trigger_webhook',
        description: 'Starts workflow on incoming HTTP POST payload',
        defaultConfig: { path: '/webhook/v1/incoming', method: 'POST' },
      },
      {
        provider: 'schedule',
        name: 'Cron / Schedule',
        category: 'trigger',
        defaultAction: 'cron_trigger',
        description: 'Triggers recurring schedule at set intervals',
        defaultConfig: { cron: '0 9 * * *', description: 'Daily at 9:00 AM' },
      },
      {
        provider: 'gmail',
        name: 'Gmail New Email',
        category: 'trigger',
        defaultAction: 'read_emails',
        description: 'Triggers when a new matching email arrives',
        defaultConfig: { filter: 'is:unread' },
      },
    ],
  },
  {
    category: 'ai',
    title: 'AI Intelligence',
    color: 'purple',
    items: [
      {
        provider: 'openrouter',
        name: 'OpenRouter AI',
        category: 'ai',
        defaultAction: 'ai_generate',
        description: 'Claude 3.5, GPT-4o, DeepSeek or Llama 3 via OpenRouter',
        defaultConfig: {
          model: 'anthropic/claude-3.5-sonnet',
          prompt: 'Analyze the incoming event payload and extract summary key insights.',
          temperature: 0.3,
        },
      },
      {
        provider: 'gemini',
        name: 'Google Gemini',
        category: 'ai',
        defaultAction: 'ai_generate',
        description: 'Gemini 1.5 Flash / Pro reasoning agent',
        defaultConfig: {
          model: 'gemini-1.5-flash',
          prompt: 'Summarize and classify the incoming operational request.',
          temperature: 0.2,
        },
      },
    ],
  },
  {
    category: 'action',
    title: 'Third-Party Actions',
    color: 'cyan',
    items: [
      {
        provider: 'slack',
        name: 'Slack Message',
        category: 'action',
        defaultAction: 'post_message',
        description: 'Send message or rich alert to a Slack channel',
        defaultConfig: {
          channel: '#general-ops',
          message: '🚨 Automated Alert: {{ai.summary || trigger.payload}}',
        },
      },
      {
        provider: 'discord',
        name: 'Discord Bot',
        category: 'action',
        defaultAction: 'post_message',
        description: 'Publish message or embed to Discord server',
        defaultConfig: {
          content: '🤖 Workflow Step Completed: {{ai.summary}}',
        },
      },
      {
        provider: 'gmail',
        name: 'Send Gmail',
        category: 'action',
        defaultAction: 'send_email',
        description: 'Dispatches HTML email to recipients',
        defaultConfig: {
          to: 'operations@company.com',
          subject: 'Agentflow Report: {{workflow.name}}',
          body: '<p>Workflow execution completed.</p><p>Result: {{ai.text}}</p>',
        },
      },
      {
        provider: 'google-sheets',
        name: 'Google Sheets Row',
        category: 'action',
        defaultAction: 'append_row',
        description: 'Appends data row to a Google Spreadsheet',
        defaultConfig: {
          spreadsheetId: 'production_ops_ledger',
          range: 'Sheet1!A:E',
          values: ['{{timestamp}}', '{{trigger.type}}', '{{ai.status}}', '{{ai.text}}'],
        },
      },
    ],
  },
  {
    category: 'logic',
    title: 'Flow Logic & Routing',
    color: 'amber',
    items: [
      {
        provider: 'filter',
        name: 'Filter / Condition',
        category: 'logic',
        defaultAction: 'filter_data',
        description: 'Evaluates javascript conditional rule on context',
        defaultConfig: {
          condition: 'payload.severity === "HIGH" || payload.confidence > 0.8',
        },
      },
    ],
  },
];
