import { ApplicationError, type ErrorMetadata } from '../../../../shared/exceptions/ApplicationError';

// Cette exception signale qu'un cas d'usage applicatif a ete invoque avec un contexte invalide.
export class ErreurUseCaseInvalide extends ApplicationError {
  // Ce constructeur initialise une erreur applicative de cas d'usage invalide.
  constructor(
    message: string,
    metadata?: ErrorMetadata,
  ) {
    super(message, 'ERREUR_USE_CASE_INVALIDE', metadata);
    this.name = 'ErreurUseCaseInvalide';
  }
}
