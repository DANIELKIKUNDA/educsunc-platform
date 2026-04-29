// Cette policy borne l'anticipation sur des obligations futures valides.
export class PolicyAnticipationFrais {
  public verifier(peutAnticiper: boolean): void {
    if (!peutAnticiper) {
      throw new Error('Aucune anticipation n est possible sur cette obligation.');
    }
  }
}
