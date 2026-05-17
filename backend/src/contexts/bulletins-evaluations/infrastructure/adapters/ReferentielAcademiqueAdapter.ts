import type {
  CodeColonneBulletin,
} from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { TypeStructureEvaluation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeStructureEvaluation';
import type {
  CoursProgrammeDTO,
  CoursReferentielDTO,
  ProgrammeNiveauDTO,
  ReferentielAcademiquePort,
} from 'contexts/bulletins-evaluations/application/ports/out/ReferentielAcademiquePort';

// Ce fichier isole l'acces futur au BC Referentiel Academique depuis l'infrastructure bulletins.
export class ReferentielAcademiqueAdapter implements ReferentielAcademiquePort {
  // Cette methode retrouvera plus tard un cours du referentiel.
  public async consulterCours(idReferentielCours: string): Promise<CoursReferentielDTO | null> {
    return {
      idReferentielCours,
      codeCours: 'INCONNU',
      libelleCours: 'Cours non synchronise',
      estCalculable: true,
      aExamen: true,
    };
  }

  // Cette methode retrouvera plus tard un programme-niveau officiel.
  public async consulterProgrammeNiveau(idProgrammeNiveau: string): Promise<ProgrammeNiveauDTO | null> {
    return {
      idProgrammeNiveau,
      typeStructureEvaluation: TypeStructureEvaluation.SEMESTRIEL,
      versionReferentielProgramme: 'INCONNUE',
    };
  }

  // Cette methode listera plus tard les cours rattaches a un programme-niveau.
  public async listerCoursProgramme(): Promise<CoursProgrammeDTO[]> {
    return [];
  }

  // Cette methode retournera plus tard les colonnes autorisees par structure.
  public async listerColonnesAutorisees(): Promise<CodeColonneBulletin[]> {
    return [];
  }
}
