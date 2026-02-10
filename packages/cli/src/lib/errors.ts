export class BlindfoldError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BlindfoldError';
    Object.setPrototypeOf(this, BlindfoldError.prototype);
  }
}

export class AuthenticationError extends BlindfoldError {
  constructor(message: string = 'Authentication failed. Check your API key.') {
    super(message);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class APIError extends BlindfoldError {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

export class NetworkError extends BlindfoldError {
  constructor(message: string = 'Network request failed. Check your connection.') {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class ConfigError extends BlindfoldError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
    Object.setPrototypeOf(this, ConfigError.prototype);
  }
}

export class InputError extends BlindfoldError {
  constructor(message: string) {
    super(message);
    this.name = 'InputError';
    Object.setPrototypeOf(this, InputError.prototype);
  }
}
