import { ApplicationError, type ErrorMetadata } from '../../../../shared/exceptions/ApplicationError';

// Ce fichier definit l'erreur racine de la couche application du BC Scolarite des Eleves.
/**
 * Cette classe sert de base aux erreurs applicatives exploitables par les interfaces.
 */
export class ErreurApplication extends ApplicationError {
  constructor(message: string, code = 'ERREUR_APPLICATION_SCOLARITE_ELEVES', metadata?: ErrorMetadata) {
    super(message, code, metadata);
    this.name = 'ErreurApplication';
  }
}
