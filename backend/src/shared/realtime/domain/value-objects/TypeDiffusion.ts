import { TypeDiffusionRealtime } from '../enums';

export class TypeDiffusion {
  public constructor(public readonly value: TypeDiffusionRealtime) {}

  public estLarge(): boolean {
    return this.value === TypeDiffusionRealtime.BROADCAST_CONTROLE;
  }
}
