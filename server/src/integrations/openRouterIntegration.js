import { BaseIntegration } from './baseIntegration.js';
import { config } from '../config/env.js';

export class OpenRouterIntegration extends BaseIntegration {
  constructor() {
    super('openrouter');
  }

  async testConnection(credentials) {
    const apiKey = credentials?.apiKey || config.OPENROUTER_API_KEY;
    if (!apiKey) {
      return { ok: false, message: 'OpenRouter API key is not configured.' };
    }
    try {
      const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (res.ok) {
        const data = await res.json();
        return { ok: true, message: 'OpenRouter API connection valid.', data };
      }
      return { ok: false, message: 'OpenRouter authentication rejected.' };
    } catch (err) {
      return { ok: false, message: `OpenRouter connection check failed: ${err.message}` };
    }
  }

  async execute(action, params = {}, credentials = {}) {
    const apiKey = credentials.apiKey || config.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('AUTH_EXPIRED: OpenRouter API key is not set or missing.');
    }

    const { prompt, systemPrompt, model = config.OPENROUTER_MODEL, temperature = 0.7, json = false } = params;

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const body = {
      model,
      messages,
      temperature,
      ...(json ? { response_format: { type: 'json_object' } } : {}),
    };

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://agentflow.ai',
        'X-Title': 'Agentflow AI Orchestrator',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      if (res.status === 401) throw new Error(`AUTH_EXPIRED: OpenRouter rejected API key.`);
      if (res.status === 429) throw new Error(`RATE_LIMIT: OpenRouter rate limit exceeded.`);
      throw new Error(`API_FAILURE: OpenRouter request failed (${res.status}): ${errData.error?.message || res.statusText}`);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || '';

    return {
      success: true,
      text: reply,
      model: data.model,
      usage: data.usage,
      provider: 'openrouter',
    };
  }
}

export const openRouterIntegration = new OpenRouterIntegration();
