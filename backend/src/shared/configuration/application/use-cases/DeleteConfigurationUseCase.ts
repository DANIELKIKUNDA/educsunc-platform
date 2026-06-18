import { ConfigurationId } from '../../domain';
import { DeleteConfigurationCommand } from '../commands';
import { ConfigurationReadModel } from '../read-models';
import {
  PortAuditConfiguration,
  PortMonitoringConfiguration,
  PortPropagationConfiguration,
  PortSuppressionConfiguration,
} from '../ports';
import { ExceptionConfigurationIntrouvable } from '../exceptions';

// Ce fichier declare le use case de suppression.

/** Cette classe orchestre la suppression technique d une configuration. */
export class DeleteConfigurationUseCase {
  constructor(
    private readonly readModel: ConfigurationReadModel,
    private readonly suppression: PortSuppressionConfiguration,
    private readonly propagation: PortPropagationConfiguration,
    private readonly audit: PortAuditConfiguration,
    private readonly monitoring: PortMonitoringConfiguration,
  ) {}

  /** Cette methode execute la suppression applicative d une configuration. */
  public async executer(commande: DeleteConfigurationCommand): Promise<void> {
    const configuration = await this.readModel.trouverParId(commande.configurationId);
    if (!configuration) {
      throw new ExceptionConfigurationIntrouvable(commande.configurationId);
    }

    await this.suppression.supprimer(ConfigurationId.creer(commande.configurationId));
    await this.propagation.propagerSuppressionConfiguration(commande.configurationId);
    await this.audit.enregistrerEvenementsConfiguration(commande.configurationId, [
      {
        type: 'ConfigurationDeleted',
        actorId: commande.actorId,
        requestId: commande.requestId,
        correlationId: commande.correlationId,
        raison: commande.raison,
        deletedAt: new Date(),
      },
    ]);
    await this.monitoring.publierSignalConfiguration('DELETED', commande.configurationId);
  }
}
