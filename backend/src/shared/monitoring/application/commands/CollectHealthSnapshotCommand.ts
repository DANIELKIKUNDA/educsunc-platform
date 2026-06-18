import type { MonitoringContextInputDto } from '../dto/input';

// Ce fichier declare la commande de collecte d un snapshot de sante.

/** Cette interface represente la commande de collecte de sante. */
export interface CollectHealthSnapshotCommand {
  readonly contexte: MonitoringContextInputDto;
}
