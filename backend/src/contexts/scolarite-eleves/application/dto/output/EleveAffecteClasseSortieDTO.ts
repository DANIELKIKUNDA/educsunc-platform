import { SexeEleve } from '../../../domain/value-objects/SexeEleve';
import { StatutEleve } from '../../../domain/value-objects/StatutEleve';

// Ce fichier definit la projection utile des eleves affectes a une classe.
export interface EleveAffecteClasseSortieDTO {
  idEleve: string;
  matricule: string;
  nom: string;
  postNom: string;
  prenom?: string;
  sexe: SexeEleve;
  statutGlobal: StatutEleve;
  idFamille?: string;
  idInscriptionScolaire: string;
  idAffectationClasse: string;
  idClassePedagogique: string;
  dateAffectation: string;
  motifAffectation?: string;
  versionAffectation: number;
}
