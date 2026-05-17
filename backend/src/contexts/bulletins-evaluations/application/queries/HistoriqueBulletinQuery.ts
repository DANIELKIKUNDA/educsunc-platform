import type { HistoriqueBulletinReadModel } from '../read-models/HistoriqueBulletinReadModel';

// Cette query lit l'historique de generation d'un bulletin.
export interface HistoriqueBulletinQuery {
  executer(idBulletinEleve: string): Promise<HistoriqueBulletinReadModel[]>;
}
