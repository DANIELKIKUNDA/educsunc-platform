import { ReferentielProgramme } from '../aggregates/ReferentielProgramme';
import { ErreurProgrammeInvalide } from '../exceptions/ErreurProgrammeInvalide';

// Cette policy porte les regles globales de protection et de versionnement du programme officiel.
export class PolicyProgramme {
  // Cette methode interdit la modification directe d'un programme officiel deja etabli.
  public interdireModificationDirecteDuProgrammeOfficiel(): never {
    throw new ErreurProgrammeInvalide(
      'Un programme officiel ne peut pas etre modifie directement; une nouvelle version est obligatoire.',
    );
  }

  // Cette methode verifie qu'un programme officiel reste toujours rattache a une version explicite.
  public verifierVersionObligatoire(referentielProgramme: ReferentielProgramme): void {
    if (referentielProgramme.obtenirVersionsReferentielProgramme().length === 0) {
      throw new ErreurProgrammeInvalide(
        'Un programme officiel doit toujours porter une version de referentiel explicite.',
      );
    }
  }
}
