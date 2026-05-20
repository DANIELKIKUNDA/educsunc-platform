import { ErreurSecurite } from './ErreurSecurite';

export class ErreurAffectationInvalide extends ErreurSecurite {
  constructor(message = 'Affectation invalide') {
    super(message);
    this.name = 'ErreurAffectationInvalide';
  }
}
