import type { MigrationBulletinReadModel } from '../read-models/MigrationBulletinReadModel';

// Cette query lit l'historique des migrations de bulletin d'une classe.
export interface HistoriqueMigrationQuery {
  executer(idClassePedagogique: string, idAnneeScolaire: string): Promise<MigrationBulletinReadModel[]>;
}
