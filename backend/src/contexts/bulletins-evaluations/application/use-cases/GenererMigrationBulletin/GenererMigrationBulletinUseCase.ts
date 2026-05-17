import { DiffColonneBulletin } from '../../../domain/entities/DiffColonneBulletin';
import type { DepotMigrationBulletin } from '../../../domain/repositories/DepotMigrationBulletin';
import type { GenererMigrationBulletinInput } from '../../dto/input/GenererMigrationBulletinInput';
import type { MigrationBulletinOutput } from '../../dto/output/MigrationBulletinOutput';
import { ApplicationException } from '../../exceptions/ApplicationException';
import type { TransactionManagerPort } from '../../ports/out/TransactionManagerPort';
import { ServiceMigrationBulletin } from '../../services/ServiceMigrationBulletin';
import { ServiceProjectionLecture } from '../../services/ServiceProjectionLecture';

// Ce use case orchestre l'analyse d'une migration de bulletin.
export class GenererMigrationBulletinUseCase {
  constructor(
    private readonly depotMigration: DepotMigrationBulletin,
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly serviceMigrationBulletin = new ServiceMigrationBulletin(),
    private readonly serviceProjectionLecture = new ServiceProjectionLecture(),
  ) {}

  // Cette methode analyse la migration puis renvoie sa projection.
  public async executer(input: GenererMigrationBulletinInput): Promise<MigrationBulletinOutput> {
    return this.transactionManagerPort.executer(async () => {
      const migrations = await this.depotMigration.listerParClasseEtAnnee(input.idClassePedagogique, input.idAnneeScolaire);
      const migration = migrations.find((element) =>
        (element as unknown as { ancienneVersionReferentiel: string }).ancienneVersionReferentiel === input.ancienneVersionReferentiel
        && (element as unknown as { nouvelleVersionReferentiel: string }).nouvelleVersionReferentiel === input.nouvelleVersionReferentiel,
      );
      if (migration === undefined) {
        throw new ApplicationException('La migration demandee est introuvable.', 'BULLETINS_MIGRATION_INTROUVABLE');
      }

      this.serviceMigrationBulletin.analyser(migration, []);
      await this.depotMigration.sauvegarder(migration);
      return this.serviceProjectionLecture.projeterMigration(migration);
    });
  }
}
