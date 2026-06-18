import { ProtectionTempeteRealtime } from '../../infrastructure';

export class RuntimeResilienceRealtime {
  constructor(private readonly protection = new ProtectionTempeteRealtime()) {}

  public autoriserVolume(volume: number): boolean {
    return this.protection.autoriser(volume);
  }
}
