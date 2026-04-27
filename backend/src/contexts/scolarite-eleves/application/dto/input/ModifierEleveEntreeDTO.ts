import { SexeEleve } from '../../../domain/value-objects/SexeEleve';
import { ContexteCommandeScolariteDTO } from './CommandesCommunesDTO';

// Ce fichier definit les donnees modifiables de l'identite d'un eleve.
export interface ModifierEleveEntreeDTO extends ContexteCommandeScolariteDTO {
  idEleve: string;
  matricule?: string;
  nom?: string;
  postNom?: string;
  prenom?: string;
  sexe?: SexeEleve;
  dateNaissance?: string;
  lieuNaissance?: string;
  nationalite?: string;
}
