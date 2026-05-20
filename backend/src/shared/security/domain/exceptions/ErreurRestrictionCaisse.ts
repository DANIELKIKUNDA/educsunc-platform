import { ErreurRestrictionMetier } from './ErreurRestrictionMetier';

export class ErreurRestrictionCaisse extends ErreurRestrictionMetier {
  constructor(message = 'Acces caisse interdit') {
    super(message);
    this.name = 'ErreurRestrictionCaisse';
  }
}
