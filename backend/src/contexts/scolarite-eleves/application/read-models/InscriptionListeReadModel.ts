import { StatutInscription } from '../../domain/value-objects/StatutInscription';

// Ce fichier definit la lecture legere d'une inscription pour les listes.
export interface InscriptionListeReadModel {
  idInscriptionScolaire: string;
  idEleve: string;
  nomCompletEleve: string;
  idAnneeScolaire: string;
  statutInscription: StatutInscription;
}
