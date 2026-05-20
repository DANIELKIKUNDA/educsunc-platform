// Ce helper regroupe les headers utilises pour identifier l'appareil client.
export class DeviceHeaders {
  public static readonly DEVICE_ID = 'x-device-id';

  // Cette methode extrait l'identifiant d'appareil si le client l'envoie.
  public static extraire(headers: unknown): string | undefined {
    if (typeof headers !== 'object' || headers === null) {
      return undefined;
    }

    const dictionnaire = headers as Record<string, unknown>;
    const valeur = dictionnaire[this.DEVICE_ID];
    return typeof valeur === 'string' && valeur.trim() !== '' ? valeur.trim() : undefined;
  }
}
