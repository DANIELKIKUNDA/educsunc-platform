import { ApplicationError, type ErrorMetadata } from '../../../../shared/exceptions/ApplicationError';

/**
 * Cette classe est la racine des exceptions metier du domaine.
 */
export class ErreurMetier extends ApplicationError {
  constructor(message: string, code = 'ERREUR_METIER', metadata?: ErrorMetadata) {
    super(message, code, metadata);
    this.name = 'ErreurMetier';
  }
}
