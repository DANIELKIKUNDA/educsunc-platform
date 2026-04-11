// Ce DTO represente les donnees attendues pour lister les programmes niveau d'une ecole et d'une annee.
export interface ListerProgrammesNiveauParEcoleEtAnneeEntree {
  idEcole: string;
  idAnneeScolaire: string;
  page: number;
  taillePage: number;
}
