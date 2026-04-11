import { ApplicationError, type ErrorMetadata } from '../../../../shared/exceptions/ApplicationError';

// Cette exception signale qu'un acteur n'est pas autorise a executer un cas d'usage applicatif.
export class ErreurAutorisationCasUsage extends ApplicationError {
  // Ce constructeur initialise une erreur applicative d'autorisation sur un cas d'usage.
  constructor(
    message: string,
    metadata?: ErrorMetadata,
  ) {
    super(message, 'ERREUR_AUTORISATION_CAS_USAGE', metadata);
    this.name = 'ErreurAutorisationCasUsage';
  }
}
