import { ContexteCommandeScolariteDTO } from './CommandesCommunesDTO';

// Ce fichier definit l'entree pour transferer un eleve hors de l'ecole source.
export interface TransfererEleveEntreeDTO extends ContexteCommandeScolariteDTO {
  idEleve: string;
  idEcoleDestination?: string;
  nomEcoleDestination?: string;
}
