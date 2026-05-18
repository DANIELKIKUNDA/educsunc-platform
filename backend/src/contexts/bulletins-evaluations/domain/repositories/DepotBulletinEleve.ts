import { BulletinEleve } from '../aggregates/BulletinEleve';
import { HistoriqueGenerationBulletin } from '../entities/HistoriqueGenerationBulletin';
import { SnapshotResultatBulletin } from '../entities/SnapshotResultatBulletin';
import { ValidationBulletinOfficielle } from '../entities/ValidationBulletinOfficielle';

// Ce contrat abstrait la persistence des bulletins d'un eleve.
export interface DepotBulletinEleve {
  sauvegarder(bulletinEleve: BulletinEleve): Promise<void>;
  trouverParEleveEtAnnee(idEleve: string, idAnneeScolaire: string): Promise<BulletinEleve | null>;
  trouverVersionActive(idEleve: string, idInscriptionScolaire: string, idAnneeScolaire: string): Promise<BulletinEleve | null>;
  listerParClasse(idClassePedagogique: string, idAnneeScolaire: string): Promise<BulletinEleve[]>;
  listerHistoriqueGenerations(idBulletinEleve: string): Promise<HistoriqueGenerationBulletin[]>;
  ajouterValidationOfficielle(validation: ValidationBulletinOfficielle): Promise<void>;
  listerValidations(idBulletinEleve: string): Promise<ValidationBulletinOfficielle[]>;
  ajouterSnapshot(snapshot: SnapshotResultatBulletin): Promise<void>;
  listerSnapshots(idBulletinEleve: string): Promise<SnapshotResultatBulletin[]>;
}
