export interface ResponsabiliteClassePedagogiqueSortie {
  id: string;
  idOrganisation: string;
  idEcole: string;
  idClassePedagogique: string;
  idClasseAcademique: string;
  idSectionScolaire: string;
  sectionCode: string;
  sectionLibelle: string;
  idAnneeScolaire: string;
  idUtilisateurEnseignant: string;
  active: boolean;
  dateDebut: string;
  dateFin?: string;
  creeLe: string;
  creePar?: string;
  version: number;
}
