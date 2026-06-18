import { CompareSnapshotsConfigurationQuery } from '../queries';
import { ConfigurationDiffDto } from '../dto';
import { ExceptionSnapshotConfigurationIntrouvable } from '../exceptions';
import { ConfigurationSnapshotReadModel } from '../read-models';
import { ServiceApplicationSnapshotsConfiguration } from '../services';

// Ce fichier declare le use case de comparaison de snapshots.

/** Cette classe orchestre la comparaison applicative de deux snapshots. */
export class CompareSnapshotsConfigurationUseCase {
  constructor(
    private readonly readModel: ConfigurationSnapshotReadModel,
    private readonly serviceSnapshots = new ServiceApplicationSnapshotsConfiguration(),
  ) {}

  /** Cette methode execute la comparaison de deux snapshots. */
  public async executer(
    query: CompareSnapshotsConfigurationQuery,
  ): Promise<ConfigurationDiffDto> {
    const snapshotSource = await this.readModel.trouverParId(
      query.configurationId,
      query.snapshotSourceId,
    );
    const snapshotCible = await this.readModel.trouverParId(
      query.configurationId,
      query.snapshotCibleId,
    );

    if (!snapshotSource) {
      throw new ExceptionSnapshotConfigurationIntrouvable(query.snapshotSourceId);
    }
    if (!snapshotCible) {
      throw new ExceptionSnapshotConfigurationIntrouvable(query.snapshotCibleId);
    }

    return this.serviceSnapshots.comparer(snapshotSource, snapshotCible);
  }
}
