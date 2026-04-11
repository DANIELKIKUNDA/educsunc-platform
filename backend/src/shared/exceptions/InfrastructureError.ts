import { ApplicationError, type ErrorMetadata } from './ApplicationError';

// Base des erreurs techniques d'infrastructure.
export class InfrastructureError extends ApplicationError {
  constructor(message: string, code = 'INFRASTRUCTURE_ERROR', metadata?: ErrorMetadata) {
    super(message, code, metadata);
    this.name = 'InfrastructureError';
  }
}
