import type { PrioriteRealtime, TypeDiffusionRealtime } from '../../domain';

export interface AppliquerPolitiqueDiffusionRealtimeCommand {
  readonly prioriteParDefaut: PrioriteRealtime;
  readonly typeDiffusionParDefaut: TypeDiffusionRealtime;
  readonly offlineFirst: boolean;
  readonly canauxAutorises: readonly string[];
}
