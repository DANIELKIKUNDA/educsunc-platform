import type { PolitiqueDiffusion } from '../../domain';

export interface PortConfigurationRealtime {
  obtenirPolitiqueCourante(): Promise<PolitiqueDiffusion>;
}
