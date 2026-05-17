import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale une cote sur une colonne non applicable.
export class ErreurCoteNonApplicable extends ErreurMetier {
  constructor(message = 'La cote est non applicable pour cette colonne.') {
    super(message);
    this.name = 'ErreurCoteNonApplicable';
  }
}
