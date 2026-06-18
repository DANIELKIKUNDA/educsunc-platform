export class FiltreDiffusion {
  public constructor(
    public readonly code: string,
    public readonly description: string,
    public readonly actif: boolean = true,
  ) {}

  public autorise(): boolean {
    return this.actif;
  }
}
