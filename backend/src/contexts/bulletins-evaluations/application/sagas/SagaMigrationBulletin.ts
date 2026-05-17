import type { AppliquerMigrationBulletinInput } from '../dto/input/AppliquerMigrationBulletinInput';
import type { GenererMigrationBulletinInput } from '../dto/input/GenererMigrationBulletinInput';
import type { MigrationBulletinOutput } from '../dto/output/MigrationBulletinOutput';
import type { AppliquerMigrationBulletinUseCase } from '../use-cases/AppliquerMigrationBulletin/AppliquerMigrationBulletinUseCase';
import type { GenererMigrationBulletinUseCase } from '../use-cases/GenererMigrationBulletin/GenererMigrationBulletinUseCase';

// Cette saga orchestre l'analyse puis l'application d'une migration de bulletin.
export class SagaMigrationBulletin {
  constructor(
    private readonly genererMigrationBulletinUseCase: GenererMigrationBulletinUseCase,
    private readonly appliquerMigrationBulletinUseCase: AppliquerMigrationBulletinUseCase,
  ) {}

  // Cette methode execute l'analyse de migration.
  public async analyser(input: GenererMigrationBulletinInput): Promise<MigrationBulletinOutput> {
    return this.genererMigrationBulletinUseCase.executer(input);
  }

  // Cette methode execute l'application de migration.
  public async appliquer(input: AppliquerMigrationBulletinInput): Promise<MigrationBulletinOutput> {
    return this.appliquerMigrationBulletinUseCase.executer(input);
  }
}
