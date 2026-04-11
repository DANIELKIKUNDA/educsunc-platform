// Ce DTO represente les donnees attendues pour initialiser un programme niveau.
export interface InitialiserProgrammeNiveauEntree {
  idEcole: string;
  idAnneeScolaire: string;
  idClasseAcademique: string;
  idReferentielProgramme: string;
  idVersionReferentielProgramme: string;
  creePar: string;
}
