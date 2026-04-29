import { ApplicationError, type ErrorMetadata } from '../../../../shared/exceptions/ApplicationError';

// Cette erreur racine porte les erreurs applicatives du BC paiements-facturation.
export class ErreurApplicationPaiements extends ApplicationError {
  constructor(message: string, code = 'ERREUR_APPLICATION_PAIEMENTS_FACTURATION', metadata?: ErrorMetadata) {
    super(message, code, metadata);
    this.name = 'ErreurApplicationPaiements';
  }
}
