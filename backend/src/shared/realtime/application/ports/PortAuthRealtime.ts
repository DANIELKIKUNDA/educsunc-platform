import type { ContexteTempsReel } from '../../domain';

export interface PortAuthRealtime {
  validerContexte(contexte: ContexteTempsReel): Promise<boolean>;
}
