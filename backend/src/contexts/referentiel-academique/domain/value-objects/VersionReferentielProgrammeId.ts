import { IdentifiantUnique } from './IdentifiantUnique';

// Cet identifiant represente une version de referentiel de programme.
export class VersionReferentielProgrammeId extends IdentifiantUnique {
  // Ce constructeur initialise ou genere l'identifiant de version de programme.
  constructor(valeur?: string) {
    super(valeur);
  }
}
