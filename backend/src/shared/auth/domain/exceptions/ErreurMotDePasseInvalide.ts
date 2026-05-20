import { ErreurAuthentification } from './ErreurAuthentification';

// Cette erreur signale qu'un mot de passe fourni ne correspond pas.
export class ErreurMotDePasseInvalide extends ErreurAuthentification {
  constructor(message = 'Mot de passe invalide') {
    super(message);
    this.name = 'ErreurMotDePasseInvalide';
  }
}
