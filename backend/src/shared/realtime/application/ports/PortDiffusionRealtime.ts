import type { MessageTempsReel } from '../../domain';

export interface PortDiffusionRealtime {
  diffuser(message: MessageTempsReel, destinataires: readonly string[]): Promise<void>;
}
