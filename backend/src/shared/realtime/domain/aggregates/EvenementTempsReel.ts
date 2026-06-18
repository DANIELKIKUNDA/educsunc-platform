import type { AudienceTempsReel, CanalTempsReel, EvenementDiffusable } from '../entities';
import type { ContexteTempsReel, PayloadTempsReel, RealtimeId } from '../value-objects';

export class EvenementTempsReel {
  public constructor(
    public readonly id: RealtimeId,
    public readonly type: string,
    public readonly diffusable: EvenementDiffusable,
    public readonly audience: AudienceTempsReel,
    public readonly canal: CanalTempsReel,
    public readonly contexte: ContexteTempsReel,
    public readonly payload: PayloadTempsReel,
  ) {}

  public peutEtreDiffuse(): boolean {
    return this.diffusable.estAutorise();
  }
}
