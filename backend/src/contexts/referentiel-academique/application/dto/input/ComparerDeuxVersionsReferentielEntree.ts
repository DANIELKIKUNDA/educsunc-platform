// Ce DTO represente les donnees attendues pour comparer deux versions de referentiel pour une classe academique.
export interface ComparerDeuxVersionsReferentielEntree {
  idClasseAcademique: string;
  versionReferentielSource: string;
  versionReferentielCible: string;
}
