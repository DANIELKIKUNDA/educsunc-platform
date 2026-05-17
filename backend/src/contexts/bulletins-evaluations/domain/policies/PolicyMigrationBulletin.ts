import { ErreurMigrationBulletinInvalide } from '../exceptions/ErreurMigrationBulletinInvalide';

// Cette policy verifie qu'une migration de bulletin reste traçable et compare bien deux versions distinctes.
export class PolicyMigrationBulletin {
  // Cette methode verifie que les deux versions de referentiel ne sont pas identiques.
  public verifier(ancienneVersionReferentiel: string, nouvelleVersionReferentiel: string): void {
    if (ancienneVersionReferentiel.trim().length === 0 || nouvelleVersionReferentiel.trim().length === 0) {
      throw new ErreurMigrationBulletinInvalide('Les versions de referentiel sont obligatoires.');
    }

    if (ancienneVersionReferentiel === nouvelleVersionReferentiel) {
      throw new ErreurMigrationBulletinInvalide('Les versions de referentiel doivent etre distinctes.');
    }
  }
}
