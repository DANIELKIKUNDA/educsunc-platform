import { StatutEleve } from '../../domain/value-objects/StatutEleve';

// Ce fichier definit la lecture legere d'un eleve pour les listes.
export interface EleveListeReadModel {
  idEleve: string;
  matricule: string;
  nomComplet: string;
  statutGlobal: StatutEleve;
  idClassePedagogique?: string;
}
