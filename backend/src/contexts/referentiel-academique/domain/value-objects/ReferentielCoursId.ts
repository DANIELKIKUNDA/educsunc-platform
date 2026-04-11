import { IdentifiantUnique } from './IdentifiantUnique';

// Cet identifiant represente une entree de referentiel de cours.
export class ReferentielCoursId extends IdentifiantUnique {
  // Ce constructeur initialise ou genere l'identifiant de referentiel de cours.
  constructor(valeur?: string) {
    super(valeur);
  }
}
