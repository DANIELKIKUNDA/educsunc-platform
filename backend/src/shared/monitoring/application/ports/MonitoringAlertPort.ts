import type { Alerte } from '../../domain';

// Ce fichier declare le port applicatif de gestion des alertes.

/** Cette interface represente le pont vers les alertes. */
export interface MonitoringAlertPort {
  enregistrerAlerte(alerte: Alerte): Promise<void>;
  retrouverAlerte(alertId: string): Promise<Alerte | null>;
  listerAlertes(): Promise<readonly Alerte[]>;
}
