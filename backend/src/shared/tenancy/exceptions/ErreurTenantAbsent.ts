import { ApplicationError } from '../../exceptions/ApplicationError';

// Cette erreur est levee lorsqu'une operation requiert un tenant courant mais qu'aucun tenant n'est present dans le contexte.
export class ErreurTenantAbsent extends ApplicationError {
  // Ce constructeur fournit un message et un code standardises pour l'absence de tenant.
  constructor(message = "Aucun tenant courant n'est defini dans le contexte.") {
    super(message, 'TENANT_ABSENT');
    this.name = 'ErreurTenantAbsent';
  }
}
