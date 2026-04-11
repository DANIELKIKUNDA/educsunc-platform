// Ce DTO represente les donnees attendues pour lister les classes pedagogiques d'une ecole et d'une annee.
export interface ListerClassesPedagogiquesParEcoleEtAnneeEntree {
  idEcole: string;
  idAnneeScolaire: string;
  page: number;
  taillePage: number;
}
