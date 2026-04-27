import { OrigineInscription } from '../../../domain/value-objects/OrigineInscription';
import { StatutInscription } from '../../../domain/value-objects/StatutInscription';

// Ce fichier definit la sortie applicative d'une inscription scolaire.
export interface InscriptionScolaireSortieDTO {
  idInscriptionScolaire: string;
  idOrganisation: string;
  idEcole: string;
  idEleve: string;
  idAnneeScolaire: string;
  dateInscription: string;
  origineInscription: OrigineInscription;
  statutInscription: StatutInscription;
  numeroOrdre?: string;
  observation?: string;
  version: number;
}
