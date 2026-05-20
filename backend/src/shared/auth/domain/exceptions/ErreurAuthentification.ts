import { ErreurAuth } from './ErreurAuth';

// Cette erreur represente un echec d'authentification standard.
export class ErreurAuthentification extends ErreurAuth {
  constructor(message = 'Authentification invalide') {
    super(message);
    this.name = 'ErreurAuthentification';
  }
}
