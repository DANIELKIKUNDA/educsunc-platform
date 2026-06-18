import type {
  CompareSnapshotsConfigurationUseCase,
  CreateSnapshotConfigurationUseCase,
} from '../../../../configuration/application';
import {
  envelopperReponseHttpConfiguration,
  enrichirContexteHttpConfiguration,
  extraireContexteHttpConfiguration,
} from './ConfigurationControllerSupport';
import type { ReponseControleurHttpConfiguration, RequeteHttpConfiguration } from './HttpConfigurationControllerTypes';
import { PresentateurHttpSnapshotsConfiguration } from '../presenters';
import {
  ValidateurHttpCompareSnapshotsConfiguration,
  ValidateurHttpSnapshotConfiguration,
} from '../validators';

// Ce fichier declare le controller HTTP des snapshots Configuration.

export class ControleurSnapshotsConfigurationHttp {
  constructor(
    private readonly createSnapshotConfigurationUseCase: CreateSnapshotConfigurationUseCase,
    private readonly compareSnapshotsConfigurationUseCase: CompareSnapshotsConfigurationUseCase,
  ) {}

  public async creer(
    requete: RequeteHttpConfiguration<{ snapshotId?: string; actorId?: string }, { id?: string }>,
  ): Promise<ReponseControleurHttpConfiguration<ReturnType<typeof PresentateurHttpSnapshotsConfiguration.presenterSnapshot>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpConfiguration(requete);
    const commande = enrichirContexteHttpConfiguration(
      ValidateurHttpSnapshotConfiguration.valider(requete.params ?? {}, requete.body),
      contexte,
    );
    const resultat = await this.createSnapshotConfigurationUseCase.executer(commande);
    return envelopperReponseHttpConfiguration(
      PresentateurHttpSnapshotsConfiguration.presenterSnapshot(resultat),
      contexte,
      commenceLe,
      201,
    );
  }

  public async comparer(
    requete: RequeteHttpConfiguration<never, { id?: string }, { sourceId?: string; cibleId?: string }>,
  ): Promise<ReponseControleurHttpConfiguration<ReturnType<typeof PresentateurHttpSnapshotsConfiguration.presenterDiff>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpConfiguration(requete);
    const query = enrichirContexteHttpConfiguration(
      ValidateurHttpCompareSnapshotsConfiguration.valider(requete.params ?? {}, requete.query ?? {}),
      contexte,
    );
    const resultat = await this.compareSnapshotsConfigurationUseCase.executer(query);
    return envelopperReponseHttpConfiguration(
      PresentateurHttpSnapshotsConfiguration.presenterDiff(resultat),
      contexte,
      commenceLe,
    );
  }
}
