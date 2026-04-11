import { IdentifiantUnique } from './IdentifiantUnique';

// Cet identifiant represente une periode interne du calendrier academique.
export class PeriodeCalendrierId extends IdentifiantUnique {
  // Ce constructeur initialise ou genere un identifiant de periode.
  constructor(valeur?: string) {
    super(valeur);
  }
}
