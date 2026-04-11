import { IdentifiantUnique } from './IdentifiantUnique';

// Cet identifiant represente un calendrier academique du referentiel.
export class CalendrierAcademiqueId extends IdentifiantUnique {
  // Ce constructeur initialise ou genere l'identifiant de calendrier academique.
  constructor(valeur?: string) {
    super(valeur);
  }
}
