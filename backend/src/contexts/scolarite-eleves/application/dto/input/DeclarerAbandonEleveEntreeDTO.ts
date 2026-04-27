import { ContexteCommandeScolariteDTO } from './CommandesCommunesDTO';

// Ce fichier definit l'entree pour declarer l'abandon d'un eleve.
export interface DeclarerAbandonEleveEntreeDTO extends ContexteCommandeScolariteDTO {
  idEleve: string;
  motif?: string;
}
