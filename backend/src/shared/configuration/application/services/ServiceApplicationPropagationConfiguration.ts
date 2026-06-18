import { PortPropagationConfiguration } from '../ports';

// Ce fichier declare le service applicatif de propagation.

/** Cette classe centralise la propagation transverse de la configuration. */
export class ServiceApplicationPropagationConfiguration {
  constructor(private readonly portPropagation: PortPropagationConfiguration) {}

  /** Cette methode propage une configuration vers ses cibles. */
  public async propager(
    configurationId: string,
    canauxCibles?: readonly string[],
  ): Promise<void> {
    await this.portPropagation.propagerConfiguration(configurationId, canauxCibles);
  }

  /** Cette methode propage une suppression de configuration. */
  public async propagerSuppression(configurationId: string): Promise<void> {
    await this.portPropagation.propagerSuppressionConfiguration(configurationId);
  }
}
