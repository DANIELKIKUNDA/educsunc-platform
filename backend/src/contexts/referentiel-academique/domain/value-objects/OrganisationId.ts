import { IdentifiantUnique } from './IdentifiantUnique';

// Cet identifiant represente une organisation transverse du referentiel academique.
export class OrganisationId extends IdentifiantUnique {
  // Ce constructeur initialise ou genere l'identifiant d'organisation.
  constructor(valeur?: string) {
    super(valeur);
  }
}
