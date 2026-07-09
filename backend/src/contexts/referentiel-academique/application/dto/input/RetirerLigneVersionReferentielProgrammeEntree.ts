// Ce DTO represente les donnees attendues pour retirer une ligne d'une version de travail.
export interface RetirerLigneVersionReferentielProgrammeEntree {
  idVersionReferentielProgramme: string;
  idLigneReferentielProgramme: string;
  retireePar: string;
}
