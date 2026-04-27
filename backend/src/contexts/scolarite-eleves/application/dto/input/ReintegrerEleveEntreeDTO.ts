import { ContexteCommandeScolariteDTO } from './CommandesCommunesDTO';

// Ce fichier definit l'entree pour reintegrer un eleve.
export interface ReintegrerEleveEntreeDTO extends ContexteCommandeScolariteDTO {
  idEleve: string;
}
