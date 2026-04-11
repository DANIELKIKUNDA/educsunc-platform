import { IdentifiantUnique } from './IdentifiantUnique';

// Cet identifiant represente un referentiel de programme academique.
export class ReferentielProgrammeId extends IdentifiantUnique {
  // Ce constructeur initialise ou genere l'identifiant de referentiel de programme.
  constructor(valeur?: string) {
    super(valeur);
  }
}
