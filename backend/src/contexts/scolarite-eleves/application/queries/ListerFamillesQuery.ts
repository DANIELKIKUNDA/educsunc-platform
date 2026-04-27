import { PaginationEntreeDTO } from '../dto/input/PaginationEntreeDTO';

// Ce fichier definit la query de liste des familles.
export interface ListerFamillesQuery extends PaginationEntreeDTO {
  idOrganisation: string;
  idEcole: string;
}
