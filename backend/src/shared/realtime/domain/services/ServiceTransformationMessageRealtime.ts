import type { EvenementTempsReel, MessageTempsReel } from '../aggregates';
import { PrioriteTempsReel, RealtimeId, TypeDiffusion } from '../value-objects';

export class ServiceTransformationMessageRealtime {
  public transformer(evenement: EvenementTempsReel): MessageTempsReel {
    const { MessageTempsReel } = require('../aggregates/MessageTempsReel') as {
      MessageTempsReel: typeof import('../aggregates/MessageTempsReel').MessageTempsReel;
    };

    return new MessageTempsReel(
      new RealtimeId(`msg-${evenement.id.value}`),
      evenement.type,
      evenement.canal,
      evenement.audience,
      new PrioriteTempsReel(evenement.diffusable.priorite),
      new TypeDiffusion(evenement.diffusable.typeDiffusion),
      evenement.payload,
      evenement.contexte,
    );
  }
}
