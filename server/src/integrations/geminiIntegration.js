import { BaseIntegration } from './baseIntegration.js';
import { config } from '../config/env.js';

export class GeminiIntegration extends BaseIntegration {
  constructor() {
    super('gemini');
  }

  async testConnection(credentials) {
    const apiKey = credentials?.apiKey || config.GEMINI_API_KEY;
    if (!apiKey) {
      return { ok: false, message: 'Gemini API key is not configured.' };
    }
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (res.ok) {
        return { ok: true, message: 'Google Gemini API key verified.' };
      }
      return { ok: false, message: 'Gemini API key verification failed.' };
    } catch (err) {
      return { ok: false, message: `Gemini check failed: ${err.message}` };
    }
  }

  async execute(action, params = {}, credentials = {}) {
    const apiKey = credentials.apiKey || config.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('AUTH_EXPIRED: Gemini API key is missing.');
    }

    const { prompt, systemPrompt, model = config.GEMINI_MODEL, temperature = 0.7, json = false } = params;

    const contents = [];
    if (systemPrompt) {
      contents.push({ role: 'user', parts: [{ text: `[System Instruction]: ${systemPrompt}` }] });
    }
    contents.push({ role: 'user', parts: [{ text: prompt }] });

    const requestBody = {
      contents,
      generationConfig: {
        temperature,
        ...(json ? { responseMimeType: 'application/json' } : {}),
      },
    };

    const modelName = model.includes('/') ? model.split('/').pop() : model;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      if (res.status === 400 && errData.error?.message?.includes('API_KEY_INVALID')) {
        throw new Error('AUTH_EXPIRED: Invalid Google Gemini API key.');
      }
      if (res.status === 429) {
        throw new Error('RATE_LIMIT: Gemini API quota exceeded.');
      }
      throw new Error(`API_FAILURE: Gemini request failed (${res.status}): ${errData.error?.message || res.statusText}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || '';

    return {
      success: true,
      text,
      model: modelName,
      provider: 'gemini',
      finishReason: candidate?.finishReason,
    };
  }
}

export const geminiIntegration = new GeminiIntegration();
