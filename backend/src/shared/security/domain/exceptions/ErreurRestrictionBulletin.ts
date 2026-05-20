import { ErreurRestrictionMetier } from './ErreurRestrictionMetier';

export class ErreurRestrictionBulletin extends ErreurRestrictionMetier {
  constructor(message = 'Acces bulletin interdit') {
    super(message);
    this.name = 'ErreurRestrictionBulletin';
  }
}
