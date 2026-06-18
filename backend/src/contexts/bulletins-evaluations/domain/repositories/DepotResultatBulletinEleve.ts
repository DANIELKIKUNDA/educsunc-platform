import { ResultatBulletinEleve } from '../aggregates/ResultatBulletinEleve';
import { HistoriqueEncodageConduite } from '../entities/HistoriqueEncodageConduite';
import { SnapshotResultatBulletin } from '../entities/SnapshotResultatBulletin';

// Ce contrat abstrait la persistence des resultats consolides d'un eleve.
export interface DepotResultatBulletinEleve {
  sauvegarder(resultatBulletinEleve: ResultatBulletinEleve): Promise<void>;
  trouverParId(idResultatBulletinEleve: string): Promise<ResultatBulletinEleve | null>;
  trouverParEleveEtAnnee(idEleve: string, idAnneeScolaire: string): Promise<ResultatBulletinEleve | null>;
  trouverParEleveInscription(idEleve: string, idInscriptionScolaire: string): Promise<ResultatBulletinEleve | null>;
  listerParClasse(idClassePedagogique: string, idAnneeScolaire: string): Promise<ResultatBulletinEleve[]>;
  listerNonClassesParClasseEtColonne(idClassePedagogique: string, codeColonne: string, idAnneeScolaire: string): Promise<ResultatBulletinEleve[]>;
  ajouterHistoriqueEncodageConduite(historiqueEncodageConduite: HistoriqueEncodageConduite): Promise<void>;
  listerHistoriqueEncodageConduite(idResultatBulletinEleve: string): Promise<HistoriqueEncodageConduite[]>;
  ajouterSnapshotResultat(snapshot: SnapshotResultatBulletin): Promise<void>;
  listerSnapshotsResultats(idResultatBulletinEleve: string): Promise<SnapshotResultatBulletin[]>;
}
