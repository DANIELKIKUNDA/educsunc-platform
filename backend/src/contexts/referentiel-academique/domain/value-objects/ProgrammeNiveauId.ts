import { IdentifiantUnique } from './IdentifiantUnique';

// Cet identifiant represente une association de programme avec un niveau.
export class ProgrammeNiveauId extends IdentifiantUnique {
  // Ce constructeur initialise ou genere l'identifiant de programme niveau.
  constructor(valeur?: string) {
    super(valeur);
  }
}
