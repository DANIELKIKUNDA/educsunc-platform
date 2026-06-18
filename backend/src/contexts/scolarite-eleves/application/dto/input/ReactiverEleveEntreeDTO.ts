import { ContexteCommandeScolariteDTO } from './CommandesCommunesDTO';

// Ce fichier definit l'entree pour reactiver explicitement un eleve.
export interface ReactiverEleveEntreeDTO extends ContexteCommandeScolariteDTO {
  idEleve: string;
}
