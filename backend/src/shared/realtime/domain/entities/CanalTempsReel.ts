export class CanalTempsReel {
  public constructor(
    public readonly nom: string,
    public readonly publicAutorise: boolean = false,
  ) {
    if (!nom.trim()) {
      throw new Error('CanalTempsReel invalide');
    }
  }
}
