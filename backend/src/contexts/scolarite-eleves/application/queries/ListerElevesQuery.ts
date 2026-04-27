import { PaginationEntreeDTO } from '../dto/input/PaginationEntreeDTO';

// Ce fichier definit la query de liste des eleves d'une ecole.
export interface ListerElevesQuery extends PaginationEntreeDTO {
  idOrganisation: string;
  idEcole: string;
}
