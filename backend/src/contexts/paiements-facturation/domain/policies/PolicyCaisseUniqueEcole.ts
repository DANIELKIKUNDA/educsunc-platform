// Cette policy impose une seule caisse active par ecole et par jour.
export class PolicyCaisseUniqueEcole {
  public verifier(caisseActiveExistante: boolean): void {
    if (caisseActiveExistante) {
      throw new Error('Une ecole ne peut posseder qu une seule caisse active par jour.');
    }
  }
}
