import { IdentifiantUnique } from './IdentifiantUnique';

// Cet identifiant represente une ligne interne d'un referentiel de programme officiel.
export class LigneReferentielProgrammeId extends IdentifiantUnique {
  // Ce constructeur initialise ou genere un identifiant de ligne de referentiel.
  constructor(valeur?: string) {
    super(valeur);
  }
}
