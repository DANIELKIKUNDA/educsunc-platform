import { ErreurAuthentification } from './ErreurAuthentification';

// Cette erreur signale qu'un compte temporairement verrouille refuse la connexion.
export class ErreurCompteVerrouille extends ErreurAuthentification {
  constructor(message = 'Compte verrouille') {
    super(message);
    this.name = 'ErreurCompteVerrouille';
  }
}
