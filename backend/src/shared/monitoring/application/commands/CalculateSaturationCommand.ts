import type { MonitoringContextInputDto } from '../dto/input';

// Ce fichier declare la commande de calcul de saturation.

/** Cette interface represente la commande de calcul de saturation. */
export interface CalculateSaturationCommand {
  readonly ressource: string;
  readonly taux: number;
  readonly contexte: MonitoringContextInputDto;
}
