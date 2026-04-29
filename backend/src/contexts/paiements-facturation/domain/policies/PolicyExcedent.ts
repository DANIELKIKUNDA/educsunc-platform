// Cette policy impose qu'un excedent soit affecte ou restitue explicitement.
export class PolicyExcedent {
  public verifier(excedentAffecte: boolean, excedentRestitue: boolean): void {
    if (!excedentAffecte && !excedentRestitue) {
      throw new Error('Un excedent financier doit etre affecte ou restitue.');
    }
  }
}
