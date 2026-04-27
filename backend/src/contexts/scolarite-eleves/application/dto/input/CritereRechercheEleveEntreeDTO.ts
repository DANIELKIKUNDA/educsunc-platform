import { PaginationEntreeDTO } from './PaginationEntreeDTO';

// Ce fichier definit les criteres applicatifs de recherche d'eleves.
export interface CritereRechercheEleveEntreeDTO extends PaginationEntreeDTO {
  idOrganisation: string;
  idEcole?: string;
  matricule?: string;
  nom?: string;
  postNom?: string;
  prenom?: string;
  dateNaissance?: string;
  idFamille?: string;
}
