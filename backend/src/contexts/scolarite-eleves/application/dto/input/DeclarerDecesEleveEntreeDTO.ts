import { ContexteCommandeScolariteDTO } from './CommandesCommunesDTO';

// Ce fichier definit l'entree pour declarer le deces d'un eleve.
export interface DeclarerDecesEleveEntreeDTO extends ContexteCommandeScolariteDTO {
  idEleve: string;
  dateDeces?: string;
}
