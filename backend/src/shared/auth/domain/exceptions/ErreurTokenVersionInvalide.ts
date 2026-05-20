import { ErreurAuthentification } from './ErreurAuthentification';

// Cette erreur signale qu'un token embarque une version obsolete ou incoherente.
export class ErreurTokenVersionInvalide extends ErreurAuthentification {
  constructor(message = 'Version de token invalide') {
    super(message);
    this.name = 'ErreurTokenVersionInvalide';
  }
}
