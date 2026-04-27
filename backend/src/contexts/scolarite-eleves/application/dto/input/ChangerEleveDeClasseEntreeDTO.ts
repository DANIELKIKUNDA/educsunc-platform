import { ContexteCommandeScolariteDTO } from './CommandesCommunesDTO';

// Ce fichier definit l'entree pour changer la classe courante d'un eleve.
export interface ChangerEleveDeClasseEntreeDTO extends ContexteCommandeScolariteDTO {
  idInscriptionScolaire: string;
  idNouvelleClassePedagogique: string;
  motifAffectation?: string;
}
