import type { MessageTempsReel } from '../../domain';
import type { MessageTempsReelDto } from '../dto/output';

export class MessageTempsReelApplicationMapper {
  public versDto(message: MessageTempsReel): MessageTempsReelDto {
    return {
      id: message.id.value,
      type: message.type,
      canal: message.canal.nom,
      priorite: message.priorite.value,
      typeDiffusion: message.typeDiffusion.value,
    };
  }
}
