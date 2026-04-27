import { EvenementParcoursSortieDTO } from './EvenementParcoursSortieDTO';

// Ce fichier definit la sortie applicative du parcours scolaire d'un eleve.
export interface ParcoursEleveSortieDTO {
  idParcoursScolaireEleve: string;
  idOrganisation: string;
  idEcole: string;
  idEleve: string;
  historique: EvenementParcoursSortieDTO[];
  version: number;
}
