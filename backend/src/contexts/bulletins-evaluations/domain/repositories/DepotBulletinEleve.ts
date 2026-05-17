import { BulletinEleve } from '../aggregates/BulletinEleve';
import { HistoriqueGenerationBulletin } from '../entities/HistoriqueGenerationBulletin';

// Ce contrat abstrait la persistence des bulletins d'un eleve.
export interface DepotBulletinEleve {
  sauvegarder(bulletinEleve: BulletinEleve): Promise<void>;
  trouverParEleveEtAnnee(idEleve: string, idAnneeScolaire: string): Promise<BulletinEleve | null>;
  trouverVersionActive(idEleve: string, idInscriptionScolaire: string, idAnneeScolaire: string): Promise<BulletinEleve | null>;
  listerParClasse(idClassePedagogique: string, idAnneeScolaire: string): Promise<BulletinEleve[]>;
  listerHistoriqueGenerations(idBulletinEleve: string): Promise<HistoriqueGenerationBulletin[]>;
}
