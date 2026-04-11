import { ApplicationError, type ErrorMetadata } from './ApplicationError';

// Base des erreurs de validation technique.
export class ValidationError extends ApplicationError {
  constructor(message: string, code = 'VALIDATION_ERROR', metadata?: ErrorMetadata) {
    super(message, code, metadata);
    this.name = 'ValidationError';
  }
}
