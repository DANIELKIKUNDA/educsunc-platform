import { PaginationEntreeDTO } from '../dto/input/PaginationEntreeDTO';

// Ce fichier definit la query des eleves d'une classe.
export interface ListerElevesParClasseQuery extends PaginationEntreeDTO {
  idOrganisation: string;
  idEcole: string;
  idClassePedagogique: string;
}
