import { ApplicationError, type ErrorMetadata } from '../../../../shared/exceptions/ApplicationError';

// Cette exception signale qu'une dependance applicative requise est absente ou indisponible.
export class ErreurDependanceApplication extends ApplicationError {
  // Ce constructeur initialise une erreur applicative de dependance manquante.
  constructor(
    message: string,
    metadata?: ErrorMetadata,
  ) {
    super(message, 'ERREUR_DEPENDANCE_APPLICATION', metadata);
    this.name = 'ErreurDependanceApplication';
  }
}
