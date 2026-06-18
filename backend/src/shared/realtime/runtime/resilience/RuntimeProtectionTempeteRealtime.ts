import { ProtectionTempeteRealtime } from '../../infrastructure';

export class RuntimeProtectionTempeteRealtime {
  constructor(private readonly protection = new ProtectionTempeteRealtime()) {}

  public verifier(volume: number): boolean {
    return this.protection.autoriser(volume);
  }
}
