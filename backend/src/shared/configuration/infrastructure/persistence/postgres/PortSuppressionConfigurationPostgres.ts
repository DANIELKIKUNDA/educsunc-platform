import type { PortSuppressionConfiguration } from '../../../application/ports';
import { ConfigurationId } from '../../../domain';
import type { SqlQueryClient } from '../../../../../shared/infrastructure/persistence/SqlQueryClient';

export class PortSuppressionConfigurationPostgres implements PortSuppressionConfiguration {
  constructor(private readonly client: SqlQueryClient) {}

  public async supprimer(identifiant: ConfigurationId): Promise<void> {
    await this.client.executer(
      'DELETE FROM educsyn_configuration_entries WHERE identifiant = $1',
      [identifiant.valeur()],
    );
  }
}
