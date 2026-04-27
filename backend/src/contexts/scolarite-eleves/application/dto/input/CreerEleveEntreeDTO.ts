import { SexeEleve } from '../../../domain/value-objects/SexeEleve';
import { TypeProvenanceEcole } from '../../../domain/value-objects/TypeProvenanceEcole';
import { ContexteCommandeScolariteDTO } from './CommandesCommunesDTO';

// Ce fichier definit les donnees necessaires pour creer un eleve.
export interface CreerEleveEntreeDTO extends ContexteCommandeScolariteDTO {
  idEleve: string;
  matricule: string;
  nom: string;
  postNom: string;
  prenom?: string;
  sexe: SexeEleve;
  dateNaissance: string;
  lieuNaissance?: string;
  nationalite?: string;
  typeProvenance: TypeProvenanceEcole;
  nomEcoleProvenance: string;
  idEcoleProvenance?: string;
  idFamille?: string;
}
