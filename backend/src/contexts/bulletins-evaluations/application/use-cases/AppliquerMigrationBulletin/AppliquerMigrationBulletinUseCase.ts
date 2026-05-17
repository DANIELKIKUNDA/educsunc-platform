import type { DepotMigrationBulletin } from '../../../domain/repositories/DepotMigrationBulletin';
import type { AppliquerMigrationBulletinInput } from '../../dto/input/AppliquerMigrationBulletinInput';
import type { MigrationBulletinOutput } from '../../dto/output/MigrationBulletinOutput';
import { ApplicationException } from '../../exceptions/ApplicationException';
import type { TransactionManagerPort } from '../../ports/out/TransactionManagerPort';
import { ServiceMigrationBulletin } from '../../services/ServiceMigrationBulletin';
import { ServiceProjectionLecture } from '../../services/ServiceProjectionLecture';

// Ce use case orchestre l'application definitive d'une migration.
export class AppliquerMigrationBulletinUseCase {
  constructor(
    private readonly depotMigration: DepotMigrationBulletin,
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly serviceMigrationBulletin = new ServiceMigrationBulletin(),
    private readonly serviceProjectionLecture = new ServiceProjectionLecture(),
  ) {}

  // Cette methode applique la migration puis renvoie sa projection.
  public async executer(input: AppliquerMigrationBulletinInput): Promise<MigrationBulletinOutput> {
    return this.transactionManagerPort.executer(async () => {
      const migration = await this.depotMigration.trouverParId(input.idMigrationBulletin);
      if (migration === null) {
        throw new ApplicationException('La migration demandee est introuvable.', 'BULLETINS_MIGRATION_INTROUVABLE');
      }

      this.serviceMigrationBulletin.appliquer(migration);
      await this.depotMigration.sauvegarder(migration);
      return this.serviceProjectionLecture.projeterMigration(migration);
    });
  }
}
