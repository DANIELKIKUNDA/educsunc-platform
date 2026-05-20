import { ErreurSecurite } from './ErreurSecurite';

// Cette erreur racine represente une restriction metier detectee.
export class ErreurRestrictionMetier extends ErreurSecurite {
  constructor(message = 'Restriction metier detectee') {
    super(message);
    this.name = 'ErreurRestrictionMetier';
  }
}
