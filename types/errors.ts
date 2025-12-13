export class AppError extends Error {
  public code: string;
  public details?: any;
  public isOperational: boolean;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', details?: any, isOperational: boolean = true) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Network request failed') {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 'AUTH_ERROR');
    this.name = 'AuthenticationError';
  }
}