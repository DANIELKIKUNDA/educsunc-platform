// Ce DTO represente les donnees attendues pour creer une classe pedagogique.
export interface CreerClassePedagogiqueEntree {
  idEcole: string;
  idAnneeScolaire: string;
  idClasseAcademique: string;
  code: string;
  libelle: string;
  suffixeParallele?: string;
  capaciteAccueil?: number;
  creePar: string;
}
