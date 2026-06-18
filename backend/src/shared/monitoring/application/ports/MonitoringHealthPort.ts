import type { EtatComposant, EtatDependance, EtatRuntime } from '../../domain';
import type { MonitoringContextInputDto } from '../dto/input';

// Ce fichier declare le port applicatif de collecte de sante.

/** Cette interface represente le pont vers les donnees de sante. */
export interface MonitoringHealthPort {
  collecterComposants(contexte: MonitoringContextInputDto): Promise<readonly EtatComposant[]>;
  collecterDependances(contexte: MonitoringContextInputDto): Promise<readonly EtatDependance[]>;
  collecterRuntime(contexte: MonitoringContextInputDto): Promise<EtatRuntime>;
}
