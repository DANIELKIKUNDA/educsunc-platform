import { ContexteCommandeScolariteDTO } from './CommandesCommunesDTO';

// Ce fichier definit l'entree pour affecter un eleve inscrit a une classe.
export interface AffecterEleveAClasseEntreeDTO extends ContexteCommandeScolariteDTO {
  idAffectationClasse: string;
  idInscriptionScolaire: string;
  idClassePedagogique: string;
  dateAffectation: string;
  motifAffectation?: string;
}
