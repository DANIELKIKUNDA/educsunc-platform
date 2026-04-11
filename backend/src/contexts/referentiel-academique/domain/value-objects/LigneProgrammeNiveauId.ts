import { IdentifiantUnique } from './IdentifiantUnique';

// Cet identifiant represente une ligne locale d'un programme de niveau.
export class LigneProgrammeNiveauId extends IdentifiantUnique {
  // Ce constructeur initialise ou genere un identifiant de ligne locale.
  constructor(valeur?: string) {
    super(valeur);
  }
}
