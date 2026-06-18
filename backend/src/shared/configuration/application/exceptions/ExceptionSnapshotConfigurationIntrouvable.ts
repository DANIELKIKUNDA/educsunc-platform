import { ExceptionConfigurationApplication } from './ExceptionConfigurationApplication';

// Ce fichier declare l exception d absence de snapshot.

/** Cette classe represente un snapshot de configuration absent. */
export class ExceptionSnapshotConfigurationIntrouvable extends ExceptionConfigurationApplication {
  constructor(snapshotId: string) {
    super(`Snapshot de configuration introuvable: ${snapshotId}`);
    this.name = 'ExceptionSnapshotConfigurationIntrouvable';
  }
}
