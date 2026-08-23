import { openRouterIntegration } from '../integrations/openRouterIntegration.js';
import { geminiIntegration } from '../integrations/geminiIntegration.js';
import { config } from '../config/env.js';

const SYSTEM_PROMPT = `
You are the AI Workflow Architect for Agentflow_AI.
Convert the user's natural language automation description into a valid, executable React Flow workflow graph.

Output MUST be a JSON object with this exact schema:
{
  "name": "Concise workflow name",
  "description": "Clear 1-2 sentence description",
  "tags": ["tag1", "tag2"],
  "trigger": {
    "type": "webhook" | "schedule" | "manual" | "email",
    "config": {}
  },
  "nodes": [
    {
      "id": "node-1",
      "type": "trigger" | "action" | "ai" | "logic",
      "position": { "x": 100, "y": 150 },
      "data": {
        "label": "Human-readable label",
        "category": "trigger" | "action" | "ai" | "logic",
        "provider": "webhook" | "schedule" | "gmail" | "slack" | "discord" | "google-sheets" | "openrouter" | "gemini" | "filter" | "delay",
        "action": "send_email" | "post_message" | "append_row" | "ai_generate" | "filter_data" | "trigger_webhook",
        "config": {
          // specific fields like to, subject, message, prompt, channel, condition, etc.
        }
      }
    }
  ],
  "edges": [
    {
      "id": "edge-node-1-node-2",
      "source": "node-1",
      "target": "node-2",
      "animated": true
    }
  ]
}

Place nodes sequentially with x spacing: x += 320, y around 150. Always return valid JSON only.
`;

export const aiGenerationService = {
  async generateWorkflowFromPrompt(prompt, userId = null) {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Prompt is required for workflow generation.');
    }

    let generated = null;
    let providerUsed = 'deterministic';

    // 1. Try OpenRouter if configured
    if (config.OPENROUTER_API_KEY) {
      try {
        const result = await openRouterIntegration.execute('chat', {
          prompt: `Create an automation workflow for: "${prompt}"`,
          systemPrompt: SYSTEM_PROMPT,
          json: true,
          temperature: 0.2,
        });
        generated = this.parseAIResponse(result.text);
        if (generated && this.validateGeneratedGraph(generated)) {
          providerUsed = 'openrouter';
        } else {
          generated = null;
        }
      } catch (err) {
        console.warn('[AI Workflow Gen] OpenRouter failed, falling back to Gemini:', err.message);
      }
    }

    // 2. Try Gemini if OpenRouter wasn't used or failed
    if (!generated && config.GEMINI_API_KEY) {
      try {
        const result = await geminiIntegration.execute('generate', {
          prompt: `Create an automation workflow for: "${prompt}"`,
          systemPrompt: SYSTEM_PROMPT,
          json: true,
          temperature: 0.2,
        });
        generated = this.parseAIResponse(result.text);
        if (generated && this.validateGeneratedGraph(generated)) {
          providerUsed = 'gemini';
        } else {
          generated = null;
        }
      } catch (err) {
        console.warn('[AI Workflow Gen] Gemini failed, falling back to Deterministic builder:', err.message);
      }
    }

    // 3. Fallback to Deterministic Rule-Based Builder
    if (!generated) {
      generated = this.buildDeterministicWorkflow(prompt);
      providerUsed = 'deterministic-fallback';
    }

    return {
      ...generated,
      metadata: {
        providerUsed,
        prompt,
        generatedAt: new Date().toISOString(),
      },
    };
  },

  parseAIResponse(text) {
    try {
      let clean = text.trim();
      if (clean.startsWith('```json')) {
        clean = clean.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (clean.startsWith('```')) {
        clean = clean.replace(/^```/, '').replace(/```$/, '').trim();
      }
      return JSON.parse(clean);
    } catch {
      return null;
    }
  },

  validateGeneratedGraph(graph) {
    return (
      graph &&
      graph.name &&
      Array.isArray(graph.nodes) &&
      graph.nodes.length > 0 &&
      Array.isArray(graph.edges)
    );
  },

  buildDeterministicWorkflow(prompt) {
    const p = prompt.toLowerCase();
    const nodes = [];
    const edges = [];
    let xOffset = 80;
    const yOffset = 180;

    const addNode = (type, category, provider, action, label, config = {}) => {
      const id = `node-${nodes.length + 1}`;
      const node = {
        id,
        type, // trigger, action, ai, logic
        position: { x: xOffset, y: yOffset },
        data: {
          label,
          category,
          provider,
          action,
          config,
        },
      };
      if (nodes.length > 0) {
        const prevId = nodes[nodes.length - 1].id;
        edges.push({
          id: `edge-${prevId}-${id}`,
          source: prevId,
          target: id,
          animated: true,
        });
      }
      nodes.push(node);
      xOffset += 320;
      return node;
    };

    // Determine Trigger
    if (p.includes('schedule') || p.includes('daily') || p.includes('hourly') || p.includes('every')) {
      addNode('trigger', 'trigger', 'schedule', 'cron_trigger', 'Cron / Schedule Trigger', {
        cron: '0 9 * * *',
        description: 'Runs daily at 9:00 AM',
      });
    } else if (p.includes('email') && (p.includes('received') || p.includes('when email arrives') || p.includes('inbox'))) {
      addNode('trigger', 'trigger', 'gmail', 'read_emails', 'Gmail New Email Trigger', {
        filter: 'is:unread',
      });
    } else {
      addNode('trigger', 'trigger', 'webhook', 'trigger_webhook', 'Webhook Trigger', {
        path: '/webhook/v1/incoming',
        method: 'POST',
      });
    }

    // Determine AI step
    if (p.includes('summarize') || p.includes('analyze') || p.includes('extract') || p.includes('ai') || p.includes('generate') || p.includes('classify')) {
      addNode('ai', 'ai', 'openrouter', 'ai_generate', 'AI Reasoning & Analysis', {
        model: 'anthropic/claude-3.5-sonnet',
        prompt: 'Analyze the incoming event payload, classify urgency, and generate a concise executive summary.',
        temperature: 0.3,
      });
    }

    // Determine Logic/Filter step
    if (p.includes('filter') || p.includes('if') || p.includes('only') || p.includes('check') || p.includes('condition')) {
      addNode('logic', 'logic', 'filter', 'filter_data', 'Condition / Data Filter', {
        condition: 'payload.severity === "HIGH" || payload.confidence > 0.8',
      });
    }

    // Determine Action 1 (Slack / Discord / Email)
    if (p.includes('slack')) {
      addNode('action', 'action', 'slack', 'post_message', 'Slack Team Alert', {
        channel: '#general-ops',
        message: '🚨 Automated Alert: {{ai.summary || trigger.data}}',
      });
    }

    if (p.includes('discord')) {
      addNode('action', 'action', 'discord', 'post_message', 'Discord Operations Bot', {
        content: '🤖 Workflow Event Triggered: {{ai.summary || trigger.event}}',
      });
    }

    if (p.includes('email') || p.includes('mail') || p.includes('gmail') || p.includes('send to')) {
      addNode('action', 'action', 'gmail', 'send_email', 'Gmail Notification', {
        to: 'operations@company.com',
        subject: 'Agentflow Automated Report',
        body: '<p>Workflow execution completed successfully.</p><p>Summary: {{ai.text || "Processed."}}</p>',
      });
    }

    // Determine Action 2 (Google Sheets append)
    if (p.includes('sheet') || p.includes('sheets') || p.includes('table') || p.includes('record') || p.includes('log')) {
      addNode('action', 'action', 'google-sheets', 'append_row', 'Google Sheets Log', {
        spreadsheetId: 'ops_ledger_2026',
        range: 'Sheet1!A:E',
        values: ['{{timestamp}}', '{{trigger.type}}', '{{ai.status || "OK"}}', '{{ai.text || "Done"}}'],
      });
    }

    // Default fallback if no action added
    if (nodes.length === 1) {
      addNode('ai', 'ai', 'openrouter', 'ai_generate', 'AI Intelligence Agent', {
        prompt: 'Process and transform incoming trigger payload',
      });
      addNode('action', 'action', 'slack', 'post_message', 'Slack Ops Notification', {
        channel: '#general-ops',
        message: 'Notification: New event processed by Agentflow_AI',
      });
    }

    const titleWords = prompt.split(' ').slice(0, 5).join(' ');
    const formattedTitle = titleWords.charAt(0).toUpperCase() + titleWords.slice(1);

    return {
      name: `${formattedTitle} Automation`,
      description: `Automated workflow generated from prompt: "${prompt}"`,
      tags: ['ai-generated', 'agentflow', 'automation'],
      trigger: {
        type: nodes[0]?.data?.provider || 'webhook',
        config: nodes[0]?.data?.config || {},
      },
      nodes,
      edges,
    };
  },
};
