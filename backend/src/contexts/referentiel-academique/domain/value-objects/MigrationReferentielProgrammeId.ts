import { IdentifiantUnique } from './IdentifiantUnique';

// Cet identifiant represente une migration de referentiel de programme.
export class MigrationReferentielProgrammeId extends IdentifiantUnique {
  // Ce constructeur initialise ou genere l'identifiant de migration de programme.
  constructor(valeur?: string) {
    super(valeur);
  }
}
