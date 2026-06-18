export class ProtectionTempeteRealtime {
  public autoriser(volume: number, seuil = 1000): boolean {
    return volume <= seuil;
  }
}
