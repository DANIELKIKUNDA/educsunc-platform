import { IdentifiantUnique } from './IdentifiantUnique';

// Cet identifiant represente une classe academique du referentiel.
export class ClasseAcademiqueId extends IdentifiantUnique {
  // Ce constructeur initialise ou genere l'identifiant de classe academique.
  constructor(valeur?: string) {
    super(valeur);
  }
}
