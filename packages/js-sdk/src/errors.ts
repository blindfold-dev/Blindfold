/**
 * Base error class for Blindfold SDK
 */
export class BlindfoldError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BlindfoldError'
    Object.setPrototypeOf(this, BlindfoldError.prototype)
  }
}

/**
 * Error thrown when authentication fails
 */
export class AuthenticationError extends BlindfoldError {
  constructor(message: string = 'Authentication failed. Please check your API key.') {
    super(message)
    this.name = 'AuthenticationError'
    Object.setPrototypeOf(this, AuthenticationError.prototype)
  }
}

/**
 * Error thrown when API request fails
 */
export class APIError extends BlindfoldError {
  statusCode: number
  responseBody?: unknown

  constructor(message: string, statusCode: number, responseBody?: unknown) {
    super(message)
    this.name = 'APIError'
    this.statusCode = statusCode
    this.responseBody = responseBody
    Object.setPrototypeOf(this, APIError.prototype)
  }
}

/**
 * Error thrown when network request fails
 */
export class NetworkError extends BlindfoldError {
  constructor(message: string = 'Network request failed. Please check your connection.') {
    super(message)
    this.name = 'NetworkError'
    Object.setPrototypeOf(this, NetworkError.prototype)
  }
}
