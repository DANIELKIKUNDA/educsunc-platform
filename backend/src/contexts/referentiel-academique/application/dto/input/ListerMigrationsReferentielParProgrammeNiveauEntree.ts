// Ce DTO represente les donnees attendues pour lister les migrations d'un programme niveau.
export interface ListerMigrationsReferentielParProgrammeNiveauEntree {
  idProgrammeNiveau: string;
  page: number;
  taillePage: number;
}
