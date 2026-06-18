import type { MessageTempsReel } from '../../domain';

export class RealtimeDiffusionMapper {
  public versSignal(message: MessageTempsReel, audience: number) {
    return {
      type: message.type,
      canal: message.canal.nom,
      audience,
      priorite: message.priorite.value,
    };
  }
}
