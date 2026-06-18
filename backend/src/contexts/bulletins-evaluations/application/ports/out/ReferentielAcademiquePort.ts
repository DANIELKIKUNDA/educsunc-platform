import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import type { TypeStructureEvaluation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeStructureEvaluation';

// Ce port lit dans le referentiel academique les regles officielles utiles au bulletin.
export interface ReferentielAcademiquePort {
  consulterCours(idReferentielCours: string): Promise<CoursReferentielDTO | null>;
  consulterProgrammeNiveau(referenceProgramme: ReferenceProgrammeNiveauDTO): Promise<ProgrammeNiveauDTO | null>;
  listerCoursProgramme(referenceProgramme: ReferenceProgrammeNiveauDTO): Promise<CoursProgrammeDTO[]>;
  listerColonnesAutorisees(typeStructureEvaluation: TypeStructureEvaluation): Promise<CodeColonneBulletin[]>;
}

export interface ReferenceProgrammeNiveauDTO {
  idProgrammeNiveau: string;
  idEcole: string;
}

export interface CoursReferentielDTO {
  idReferentielCours: string;
  codeCours: string;
  libelleCours: string;
  estCalculable: boolean;
  aExamen: boolean;
}

export interface ProgrammeNiveauDTO {
  idProgrammeNiveau: string;
  idClassePedagogique?: string;
  typeStructureEvaluation: TypeStructureEvaluation;
  versionReferentielProgramme: string;
  statutProgrammeNiveau: 'BROUILLON' | 'VALIDE' | 'ARCHIVE';
}

export interface CoursProgrammeDTO {
  idReferentielCours: string;
  codeCours: string;
  libelleCours: string;
  ordreAffichage: number;
  estCalculable: boolean;
  aExamen: boolean;
}
