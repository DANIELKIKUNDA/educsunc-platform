import { ReloadRuntimeConfigurationCommand } from '../commands';
import { ExceptionConfigurationIntrouvable } from '../exceptions';
import { PortReloadRuntimeConfiguration } from '../ports';
import { ConfigurationReadModel } from '../read-models';
import { ValidateurReloadRuntimeConfiguration } from '../validators';

// Ce fichier declare le use case de reload runtime.

/** Cette classe orchestre le reload runtime applicatif d une configuration. */
export class ReloadRuntimeConfigurationUseCase {
  constructor(
    private readonly readModel: ConfigurationReadModel,
    private readonly portReloadRuntime: PortReloadRuntimeConfiguration,
    private readonly validateur = new ValidateurReloadRuntimeConfiguration(),
  ) {}

  /** Cette methode execute le reload runtime applicatif. */
  public async executer(commande: ReloadRuntimeConfigurationCommand): Promise<void> {
    this.validateur.valider(commande);
    const configuration = await this.readModel.trouverParId(commande.configurationId);
    if (!configuration) {
      throw new ExceptionConfigurationIntrouvable(commande.configurationId);
    }

    await this.portReloadRuntime.rechargerConfigurationRuntime(
      commande.configurationId,
      commande.forcer ?? false,
    );
  }
}
