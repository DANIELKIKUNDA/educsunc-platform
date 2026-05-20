import { ErreurSecurite } from './ErreurSecurite';

export class ErreurAffectationExpiree extends ErreurSecurite {
  constructor(message = 'Affectation expiree') {
    super(message);
    this.name = 'ErreurAffectationExpiree';
  }
}
