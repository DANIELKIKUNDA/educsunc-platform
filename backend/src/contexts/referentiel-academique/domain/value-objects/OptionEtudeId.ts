import { IdentifiantUnique } from './IdentifiantUnique';

// Cet identifiant represente une option d'etude du referentiel academique.
export class OptionEtudeId extends IdentifiantUnique {
  // Ce constructeur initialise ou genere l'identifiant d'option d'etude.
  constructor(valeur?: string) {
    super(valeur);
  }
}
