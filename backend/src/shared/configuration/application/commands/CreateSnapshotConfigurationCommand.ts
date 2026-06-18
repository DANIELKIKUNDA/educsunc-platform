import { PorteeConfigurationProps } from '../../domain';

// Ce fichier declare la commande de creation de snapshot.

/** Cette interface represente les donnees necessaires a la creation d un snapshot. */
export interface CreateSnapshotConfigurationCommand {
  readonly configurationId: string;
  readonly snapshotId?: string;
  readonly scope?: PorteeConfigurationProps;
  readonly actorId?: string;
}
