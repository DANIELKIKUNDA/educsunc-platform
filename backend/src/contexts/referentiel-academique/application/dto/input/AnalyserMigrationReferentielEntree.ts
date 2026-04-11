// Ce DTO represente les donnees attendues pour analyser une migration de referentiel.
export interface AnalyserMigrationReferentielEntree {
  idProgrammeNiveau: string;
  idAncienneVersionReferentiel: string;
  idNouvelleVersionReferentiel: string;
  declenchePar: string;
}
