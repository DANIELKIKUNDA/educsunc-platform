import { SexeEleve } from '../../../domain/value-objects/SexeEleve';
import { StatutEleve } from '../../../domain/value-objects/StatutEleve';
import { TypeProvenanceEcole } from '../../../domain/value-objects/TypeProvenanceEcole';

// Ce fichier definit la sortie applicative synthetique d'un eleve.
export interface EleveSortieDTO {
  idEleve: string;
  idOrganisation: string;
  idEcole: string;
  matricule: string;
  nom: string;
  postNom: string;
  prenom?: string;
  sexe: SexeEleve;
  dateNaissance: string;
  statutGlobal: StatutEleve;
  idFamille?: string;
  typeProvenance: TypeProvenanceEcole;
  nomEcoleProvenance: string;
  version: number;
}
