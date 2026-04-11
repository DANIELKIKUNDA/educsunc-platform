import { IdentifiantUnique } from './IdentifiantUnique';

// Cet identifiant represente une classe pedagogique rattachee au referentiel.
export class ClassePedagogiqueId extends IdentifiantUnique {
  // Ce constructeur initialise ou genere l'identifiant de classe pedagogique.
  constructor(valeur?: string) {
    super(valeur);
  }
}
