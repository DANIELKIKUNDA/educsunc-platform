import { PaginationEntreeDTO } from '../dto/input/PaginationEntreeDTO';

// Ce fichier definit la query de liste des inscriptions.
export interface ListerInscriptionsQuery extends PaginationEntreeDTO {
  idOrganisation: string;
  idEcole: string;
  idAnneeScolaire: string;
}
