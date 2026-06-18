export class ValeurUtilisateur {
  public constructor(
    public readonly utileImmediatement: boolean,
    public readonly raison: string,
  ) {
    if (!raison.trim()) {
      throw new Error('ValeurUtilisateur sans raison');
    }
  }

  public autoriseDiffusion(): boolean {
    return this.utileImmediatement;
  }
}
