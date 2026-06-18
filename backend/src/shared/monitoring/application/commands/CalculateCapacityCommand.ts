import type { MonitoringContextInputDto } from '../dto/input';

// Ce fichier declare la commande de calcul de capacite.

/** Cette interface represente la commande de calcul de capacite. */
export interface CalculateCapacityCommand {
  readonly ressource: string;
  readonly utilisationActuelle: number;
  readonly capaciteMax: number;
  readonly contexte: MonitoringContextInputDto;
}
