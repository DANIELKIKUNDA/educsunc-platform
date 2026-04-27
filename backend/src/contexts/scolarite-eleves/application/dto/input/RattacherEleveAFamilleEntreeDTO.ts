import { ContexteCommandeScolariteDTO } from './CommandesCommunesDTO';

// Ce fichier definit l'entree pour rattacher un eleve a une famille.
export interface RattacherEleveAFamilleEntreeDTO extends ContexteCommandeScolariteDTO {
  idEleve: string;
  idFamille: string;
}
