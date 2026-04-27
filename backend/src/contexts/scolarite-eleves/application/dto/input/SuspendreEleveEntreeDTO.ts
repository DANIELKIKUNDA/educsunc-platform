import { ContexteCommandeScolariteDTO } from './CommandesCommunesDTO';

// Ce fichier definit l'entree pour suspendre un eleve.
export interface SuspendreEleveEntreeDTO extends ContexteCommandeScolariteDTO {
  idEleve: string;
  motif?: string;
}
