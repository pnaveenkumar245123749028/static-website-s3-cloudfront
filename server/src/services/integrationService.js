import { IntegrationModel } from '../models/Integration.js';
import { encrypt, decrypt, maskSecret } from './cryptoService.js';
import { gmailIntegration } from '../integrations/gmailIntegration.js';
import { slackIntegration } from '../integrations/slackIntegration.js';
import { discordIntegration } from '../integrations/discordIntegration.js';
import { sheetsIntegration } from '../integrations/sheetsIntegration.js';
import { openRouterIntegration } from '../integrations/openRouterIntegration.js';
import { geminiIntegration } from '../integrations/geminiIntegration.js';
import { config } from '../config/env.js';

const integrationsMap = {
  gmail: gmailIntegration,
  slack: slackIntegration,
  discord: discordIntegration,
  'google-sheets': sheetsIntegration,
  openrouter: openRouterIntegration,
  gemini: geminiIntegration,
};

export const integrationService = {
  getProvider(provider) {
    const key = provider.toLowerCase();
    const handler = integrationsMap[key];
    if (!handler) throw new Error(`Provider "${provider}" is not supported.`);
    return handler;
  },

  async listUserIntegrations(userId) {
    const stored = await IntegrationModel.findByUserId(userId);
    const supported = ['gmail', 'slack', 'discord', 'google-sheets', 'openrouter', 'gemini'];

    const results = supported.map((provider) => {
      const existing = stored.find((i) => i.provider === provider);
      const isEnvConfigured = this.checkEnvConfiguration(provider);

      if (existing) {
        return {
          id: existing._id,
          provider,
          status: existing.status,
          enabled: existing.enabled !== false,
          scopes: existing.scopes || [],
          expiresAt: existing.expiresAt,
          metadata: existing.metadata || {},
          hasApiKey: !!existing.encryptedApiKey,
          hasAccessToken: !!existing.encryptedAccessToken,
          updatedAt: existing.updatedAt,
          isEnvConfigured,
        };
      }

      return {
        provider,
        status: isEnvConfigured ? 'connected' : 'disconnected',
        enabled: true,
        scopes: [],
        expiresAt: null,
        metadata: {},
        hasApiKey: false,
        hasAccessToken: false,
        updatedAt: null,
        isEnvConfigured,
      };
    });

    return results;
  },

  checkEnvConfiguration(provider) {
    switch (provider) {
      case 'openrouter':
        return !!config.OPENROUTER_API_KEY;
      case 'gemini':
        return !!config.GEMINI_API_KEY;
      case 'gmail':
        return !!(config.GMAIL_CLIENT_ID && config.GMAIL_CLIENT_SECRET);
      case 'slack':
        return !!(config.SLACK_CLIENT_ID && config.SLACK_CLIENT_SECRET);
      case 'discord':
        return !!(config.DISCORD_BOT_TOKEN || (config.DISCORD_CLIENT_ID && config.DISCORD_CLIENT_SECRET));
      case 'google-sheets':
        return !!(config.SHEETS_CLIENT_ID && config.SHEETS_CLIENT_SECRET);
      default:
        return false;
    }
  },

  async getOAuthUrl(provider, state) {
    const handler = this.getProvider(provider);
    return handler.getAuthUrl(state);
  },

  async handleOAuthCallback(provider, code, userId) {
    const handler = this.getProvider(provider);
    const tokenData = await handler.handleCallback(code);

    const integrationData = {
      status: 'connected',
      encryptedAccessToken: tokenData.accessToken ? encrypt(tokenData.accessToken) : null,
      encryptedRefreshToken: tokenData.refreshToken ? encrypt(tokenData.refreshToken) : null,
      scopes: tokenData.scopes || [],
      expiresAt: tokenData.expiresIn ? new Date(Date.now() + tokenData.expiresIn * 1000) : null,
      metadata: tokenData.metadata || {},
      errorMessage: null,
      enabled: true,
    };

    return IntegrationModel.upsert(userId, provider, integrationData);
  },

  async saveApiKey(userId, provider, apiKey, metadata = {}) {
    if (!apiKey) throw new Error('API key cannot be empty');
    const integrationData = {
      status: 'connected',
      encryptedApiKey: encrypt(apiKey),
      metadata,
      errorMessage: null,
      enabled: true,
    };
    return IntegrationModel.upsert(userId, provider, integrationData);
  },

  async getDecryptedCredentials(userId, provider) {
    const record = await IntegrationModel.findByUserAndProvider(userId, provider);
    let accessToken = null;
    let refreshToken = null;
    let apiKey = null;

    if (record) {
      if (record.encryptedAccessToken) accessToken = decrypt(record.encryptedAccessToken);
      if (record.encryptedRefreshToken) refreshToken = decrypt(record.encryptedRefreshToken);
      if (record.encryptedApiKey) apiKey = decrypt(record.encryptedApiKey);
      return {
        accessToken,
        refreshToken,
        apiKey,
        metadata: record.metadata || {},
        enabled: record.enabled !== false,
        status: record.status,
      };
    }

    // Fallback to environment variables if integration record not explicitly in database
    if (provider === 'openrouter' && config.OPENROUTER_API_KEY) {
      return { apiKey: config.OPENROUTER_API_KEY, metadata: {}, enabled: true, status: 'connected' };
    }
    if (provider === 'gemini' && config.GEMINI_API_KEY) {
      return { apiKey: config.GEMINI_API_KEY, metadata: {}, enabled: true, status: 'connected' };
    }
    if (provider === 'discord' && config.DISCORD_BOT_TOKEN) {
      return { apiKey: config.DISCORD_BOT_TOKEN, metadata: {}, enabled: true, status: 'connected' };
    }

    return {
      accessToken: null,
      refreshToken: null,
      apiKey: null,
      metadata: {},
      enabled: false,
      status: 'disconnected',
    };
  },

  async testConnection(userId, provider) {
    const credentials = await this.getDecryptedCredentials(userId, provider);
    const handler = this.getProvider(provider);
    return handler.testConnection(credentials);
  },

  async executeAction(userId, provider, action, params = {}) {
    const credentials = await this.getDecryptedCredentials(userId, provider);
    const handler = this.getProvider(provider);
    return handler.execute(action, params, credentials);
  },

  async toggleIntegration(userId, provider, enabled) {
    const record = await IntegrationModel.findByUserAndProvider(userId, provider);
    if (!record) {
      return IntegrationModel.upsert(userId, provider, {
        enabled,
        status: enabled ? 'connected' : 'disconnected',
      });
    }
    return IntegrationModel.upsert(userId, provider, { enabled });
  },

  async disconnect(userId, provider) {
    return IntegrationModel.delete(userId, provider);
  },
};
