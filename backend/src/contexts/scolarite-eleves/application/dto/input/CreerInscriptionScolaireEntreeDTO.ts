import { OrigineInscription } from '../../../domain/value-objects/OrigineInscription';
import { ContexteCommandeScolariteDTO } from './CommandesCommunesDTO';

// Ce fichier definit l'entree pour creer une inscription scolaire annuelle.
export interface CreerInscriptionScolaireEntreeDTO extends ContexteCommandeScolariteDTO {
  idInscriptionScolaire: string;
  idEleve: string;
  idAnneeScolaire: string;
  dateInscription: string;
  origineInscription: OrigineInscription;
  numeroOrdre?: string;
  observation?: string;
}
