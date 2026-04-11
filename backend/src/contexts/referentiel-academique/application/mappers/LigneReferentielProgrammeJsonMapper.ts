import { LigneReferentielProgramme } from '../../domain/entities/LigneReferentielProgramme';
import { LigneReferentielProgrammeId } from '../../domain/value-objects/LigneReferentielProgrammeId';
import { PonderationEvaluation } from '../../domain/value-objects/PonderationEvaluation';
import { ReferentielCoursId } from '../../domain/value-objects/ReferentielCoursId';
import { EnregistrementLigneReferentielProgrammeJson } from '../dto/input/EnregistrementLigneReferentielProgrammeJson';

// Ce mapper transforme une ligne brute issue d'un JSON parse en entite de domaine.
export class LigneReferentielProgrammeJsonMapper {
  // Cette methode projette une ligne brute de JSON vers une entite de domaine validee.
  public static versEntite(
    enregistrement: EnregistrementLigneReferentielProgrammeJson,
  ): LigneReferentielProgramme {
    return new LigneReferentielProgramme(
      new LigneReferentielProgrammeId(),
      new ReferentielCoursId(enregistrement.idReferentielCours),
      enregistrement.ordreAffichage,
      enregistrement.obligatoire,
      enregistrement.aExamen,
      enregistrement.estCalculable,
      enregistrement.sourceLigne,
      new PonderationEvaluation(enregistrement.ponderation),
    );
  }

  // Cette methode projette une collection de lignes brutes de JSON vers des entites de domaine valides.
  public static versEntites(
    enregistrements: readonly EnregistrementLigneReferentielProgrammeJson[],
  ): LigneReferentielProgramme[] {
    return enregistrements.map((enregistrement) => this.versEntite(enregistrement));
  }
}
