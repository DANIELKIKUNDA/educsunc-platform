import { IdentifiantUnique } from './IdentifiantUnique';

// Cet identifiant represente une annee scolaire definie dans le referentiel academique.
export class AnneeScolaireId extends IdentifiantUnique {
  // Ce constructeur initialise ou genere l'identifiant d'annee scolaire.
  constructor(valeur?: string) {
    super(valeur);
  }
}
