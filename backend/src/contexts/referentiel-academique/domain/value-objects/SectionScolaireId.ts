import { IdentifiantUnique } from './IdentifiantUnique';

// Cet identifiant represente une section scolaire du referentiel academique.
export class SectionScolaireId extends IdentifiantUnique {
  // Ce constructeur initialise ou genere l'identifiant de section scolaire.
  constructor(valeur?: string) {
    super(valeur);
  }
}
