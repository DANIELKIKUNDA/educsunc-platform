import type { BulletinEleveReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinEleveReadModel';
import {
  obtenirMemoireTechniqueBulletins,
  type SnapshotBulletinPersistant,
} from '../persistence/postgres/depots/outilsDepotBulletin';

// Ce fichier gere les snapshots locaux des bulletins pour reprise, audit et archivage.
export class BulletinSnapshotService {
  // Cette methode cree ou remplace un snapshot complet d'un bulletin.
  public enregistrerSnapshot(
    idSnapshot: string,
    bulletin: BulletinEleveReadModel,
  ): SnapshotBulletinPersistant {
    const snapshot: SnapshotBulletinPersistant = {
      idSnapshot,
      idBulletinEleve: bulletin.idBulletinEleve,
      dateSnapshot: new Date(),
      versionBulletin: bulletin.versionBulletin,
      bulletin,
    };
    obtenirMemoireTechniqueBulletins().snapshotsBulletins.set(idSnapshot, snapshot);
    return snapshot;
  }

  // Cette methode relit un snapshot connu.
  public relireSnapshot(idSnapshot: string): SnapshotBulletinPersistant | null {
    return obtenirMemoireTechniqueBulletins().snapshotsBulletins.get(idSnapshot) ?? null;
  }
}
