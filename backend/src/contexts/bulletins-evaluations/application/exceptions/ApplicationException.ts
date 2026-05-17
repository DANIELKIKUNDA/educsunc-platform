import { ApplicationError, type ErrorMetadata } from '../../../../shared/exceptions/ApplicationError';

// Cette erreur racine porte toutes les erreurs applicatives du BC Bulletins & Resultats.
export class ApplicationException extends ApplicationError {
  constructor(message: string, code = 'BULLETINS_APPLICATION_EXCEPTION', metadata?: ErrorMetadata) {
    super(message, code, metadata);
    this.name = 'ApplicationException';
  }
}
