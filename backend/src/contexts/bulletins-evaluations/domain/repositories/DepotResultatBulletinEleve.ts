import { ResultatBulletinEleve } from '../aggregates/ResultatBulletinEleve';
import { SnapshotResultatBulletin } from '../entities/SnapshotResultatBulletin';

// Ce contrat abstrait la persistence des resultats consolides d'un eleve.
export interface DepotResultatBulletinEleve {
  sauvegarder(resultatBulletinEleve: ResultatBulletinEleve): Promise<void>;
  trouverParEleveEtAnnee(idEleve: string, idAnneeScolaire: string): Promise<ResultatBulletinEleve | null>;
  trouverParEleveInscription(idEleve: string, idInscriptionScolaire: string): Promise<ResultatBulletinEleve | null>;
  listerParClasse(idClassePedagogique: string, idAnneeScolaire: string): Promise<ResultatBulletinEleve[]>;
  listerNonClassesParClasseEtColonne(idClassePedagogique: string, codeColonne: string, idAnneeScolaire: string): Promise<ResultatBulletinEleve[]>;
  ajouterSnapshotResultat(snapshot: SnapshotResultatBulletin): Promise<void>;
  listerSnapshotsResultats(idResultatBulletinEleve: string): Promise<SnapshotResultatBulletin[]>;
}
