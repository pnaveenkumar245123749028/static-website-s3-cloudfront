import { integrationService } from '../services/integrationService.js';
import { config } from '../config/env.js';

export const integrationController = {
  async list(req, res, next) {
    try {
      const integrations = await integrationService.listUserIntegrations(req.user.id);
      res.status(200).json({ success: true, data: { integrations } });
    } catch (err) {
      next(err);
    }
  },

  async getStatus(req, res, next) {
    try {
      const integrations = await integrationService.listUserIntegrations(req.user.id);
      const statuses = {};
      for (const item of integrations) {
        statuses[item.provider] = {
          status: item.status,
          enabled: item.enabled,
          isEnvConfigured: item.isEnvConfigured,
          lastUpdated: item.updatedAt,
        };
      }
      res.status(200).json({ success: true, data: { statuses } });
    } catch (err) {
      next(err);
    }
  },

  async startOAuth(req, res, next) {
    try {
      const { provider } = req.params;
      const state = Buffer.from(JSON.stringify({ userId: req.user.id, provider, ts: Date.now() })).toString('base64');
      const authUrl = await integrationService.getOAuthUrl(provider, state);
      res.status(200).json({ success: true, data: { authUrl } });
    } catch (err) {
      next(err);
    }
  },

  async handleCallback(req, res, next) {
    try {
      const { provider } = req.params;
      const { code, state, error } = req.query;

      if (error) {
        return res.redirect(`${config.CLIENT_URL}/integrations?error=${encodeURIComponent(error)}`);
      }

      let userId = req.user?.id;
      if (!userId && state) {
        try {
          const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
          userId = decodedState.userId;
        } catch {}
      }

      if (!userId) {
        return res.redirect(`${config.CLIENT_URL}/integrations?error=invalid_state_session`);
      }

      await integrationService.handleOAuthCallback(provider, code || 'simulated_oauth_code', userId);
      res.redirect(`${config.CLIENT_URL}/integrations?connected=${provider}`);
    } catch (err) {
      res.redirect(`${config.CLIENT_URL}/integrations?error=${encodeURIComponent(err.message)}`);
    }
  },

  async oauthError(req, res) {
    res.status(400).json({
      success: false,
      error: req.query.message || 'OAuth authentication failed with provider.',
      code: 'OAUTH_FAILED',
    });
  },

  async saveApiKey(req, res, next) {
    try {
      const { provider, apiKey, metadata, enabled } = req.body;
      if (!provider) throw new Error('Provider name is required.');

      let result;
      if (apiKey) {
        result = await integrationService.saveApiKey(req.user.id, provider, apiKey, metadata);
      } else if (enabled !== undefined) {
        result = await integrationService.toggleIntegration(req.user.id, provider, enabled);
      }

      res.status(200).json({ success: true, message: `Integration ${provider} updated successfully.`, data: result });
    } catch (err) {
      next(err);
    }
  },

  async testConnection(req, res, next) {
    try {
      const { provider } = req.params;
      const result = await integrationService.testConnection(req.user.id, provider);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async disconnect(req, res, next) {
    try {
      const { provider } = req.params;
      await integrationService.disconnect(req.user.id, provider);
      res.status(200).json({ success: true, message: `Disconnected ${provider}.` });
    } catch (err) {
      next(err);
    }
  },
};
