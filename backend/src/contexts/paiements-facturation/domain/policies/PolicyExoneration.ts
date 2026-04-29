// Cette policy rappelle qu'une exoneration doit etre validee par une personne autorisee.
export class PolicyExoneration {
  public verifier(idValidateur: string, montantExonere: number): void {
    if (typeof idValidateur !== 'string' || idValidateur.trim().length === 0 || montantExonere <= 0) {
      throw new Error('Une exoneration doit etre autorisee et porter un montant strictement positif.');
    }
  }
}
