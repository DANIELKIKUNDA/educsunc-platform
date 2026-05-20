import { ErreurSecurite } from './ErreurSecurite';

// Cette erreur racine represente un refus global d'autorisation.
export class ErreurAutorisation extends ErreurSecurite {
  constructor(message = 'Autorisation refusee') {
    super(message);
    this.name = 'ErreurAutorisation';
  }
}
