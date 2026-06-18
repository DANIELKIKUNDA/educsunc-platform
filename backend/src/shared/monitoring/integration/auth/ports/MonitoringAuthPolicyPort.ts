import type { MonitoringAuthDemandeAutorisation } from '../MonitoringAuthIntegrationTypes';

// Ce fichier declare le port de policy Auth pour Monitoring.

export interface MonitoringAuthPolicyPort {
  autoriser(demande: MonitoringAuthDemandeAutorisation): Promise<boolean>;
}
