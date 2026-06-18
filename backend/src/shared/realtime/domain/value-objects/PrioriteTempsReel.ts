import { PrioriteRealtime } from '../enums';

export class PrioriteTempsReel {
  public constructor(public readonly value: PrioriteRealtime) {}

  public estCritique(): boolean {
    return this.value === PrioriteRealtime.CRITIQUE;
  }
}
