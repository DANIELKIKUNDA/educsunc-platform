import { IdentifiantUnique } from './IdentifiantUnique';

// Cet identifiant represente une ecole referencee dans le referentiel academique.
export class EcoleId extends IdentifiantUnique {
  // Ce constructeur initialise ou genere l'identifiant d'ecole.
  constructor(valeur?: string) {
    super(valeur);
  }
}
