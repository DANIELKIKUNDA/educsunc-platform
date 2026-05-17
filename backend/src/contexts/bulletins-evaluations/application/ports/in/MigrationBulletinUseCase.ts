import type { AppliquerMigrationBulletinInput } from '../../dto/input/AppliquerMigrationBulletinInput';
import type { GenererMigrationBulletinInput } from '../../dto/input/GenererMigrationBulletinInput';
import type { MigrationBulletinOutput } from '../../dto/output/MigrationBulletinOutput';

// Ce contrat expose l'analyse et l'application d'une migration de bulletin.
export interface MigrationBulletinUseCase {
  analyser(input: GenererMigrationBulletinInput): Promise<MigrationBulletinOutput>;
  appliquer(input: AppliquerMigrationBulletinInput): Promise<MigrationBulletinOutput>;
}
