import { ErreurRestrictionMetier } from './ErreurRestrictionMetier';

export class ErreurRestrictionFinanciere extends ErreurRestrictionMetier {
  constructor(message = 'Acces financier interdit') {
    super(message);
    this.name = 'ErreurRestrictionFinanciere';
  }
}
