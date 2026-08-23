export class BaseIntegration {
  constructor(providerName) {
    this.providerName = providerName;
  }

  getAuthUrl(state) {
    throw new Error(`getAuthUrl not implemented for ${this.providerName}`);
  }

  async handleCallback(code, state) {
    throw new Error(`handleCallback not implemented for ${this.providerName}`);
  }

  async testConnection(credentials) {
    throw new Error(`testConnection not implemented for ${this.providerName}`);
  }

  async execute(action, params, credentials) {
    throw new Error(`execute not implemented for ${this.providerName}`);
  }
}
