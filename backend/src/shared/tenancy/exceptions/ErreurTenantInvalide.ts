import { ValidationError } from '../../exceptions/ValidationError';

// Cette erreur est levee lorsqu'un tenant ou une information associee est vide, mal formee ou inutilisable.
export class ErreurTenantInvalide extends ValidationError {
  // Ce constructeur accepte un message personnalise et conserve un code standard pour les cas invalides.
  constructor(message = 'Le tenant fourni est invalide.', code = 'TENANT_INVALIDE') {
    super(message, code);
    this.name = 'ErreurTenantInvalide';
  }
}
