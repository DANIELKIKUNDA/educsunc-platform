import type { AudienceTempsReel, CanalTempsReel } from '../entities';
import type {
  ContexteTempsReel,
  PayloadTempsReel,
  PrioriteTempsReel,
  RealtimeId,
  TypeDiffusion,
} from '../value-objects';

export class MessageTempsReel {
  public constructor(
    public readonly id: RealtimeId,
    public readonly type: string,
    public readonly canal: CanalTempsReel,
    public readonly audience: AudienceTempsReel,
    public readonly priorite: PrioriteTempsReel,
    public readonly typeDiffusion: TypeDiffusion,
    public readonly payload: PayloadTempsReel,
    public readonly contexte: ContexteTempsReel,
  ) {}
}
