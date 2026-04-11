export type ErrorMetadata = Record<string, unknown>;

// Base des erreurs applicatives techniques.
export class ApplicationError extends Error {
  public readonly code: string;
  public readonly metadata?: ErrorMetadata;

  constructor(message: string, code = 'APPLICATION_ERROR', metadata?: ErrorMetadata) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.metadata = metadata;
  }
}
