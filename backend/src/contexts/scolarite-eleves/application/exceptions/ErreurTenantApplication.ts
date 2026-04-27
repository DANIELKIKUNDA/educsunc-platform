import { ErreurApplication } from './ErreurApplication';

// Ce fichier contient l'erreur applicative de tenant.
/**
 * Cette erreur signale un contexte organisation/ecole absent ou incoherent.
 */
export class ErreurTenantApplication extends ErreurApplication {
  constructor(message = 'Le contexte tenant est invalide.') {
    super(message, 'ERREUR_TENANT_APPLICATION_SCOLARITE_ELEVES');
    this.name = 'ErreurTenantApplication';
  }
}
