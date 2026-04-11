import { ApplicationError, type ErrorMetadata } from '../../../../shared/exceptions/ApplicationError';

// Cette exception signale qu'un flux applicatif d'import de referentiel a echoue.
export class ErreurImportReferentielApplication extends ApplicationError {
  // Ce constructeur initialise une erreur applicative d'import de referentiel.
  constructor(
    message: string,
    metadata?: ErrorMetadata,
  ) {
    super(message, 'ERREUR_IMPORT_REFERENTIEL_APPLICATION', metadata);
    this.name = 'ErreurImportReferentielApplication';
  }
}
