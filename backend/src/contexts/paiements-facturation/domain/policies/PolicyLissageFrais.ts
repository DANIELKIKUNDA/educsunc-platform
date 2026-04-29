// Cette policy borne l'usage d'un plan de lissage actif et coherent.
export class PolicyLissageFrais {
  public verifier(planActif: boolean, moisSupportsNonVides: boolean, moisCiblesNonVides: boolean): void {
    if (!planActif || !moisSupportsNonVides || !moisCiblesNonVides) {
      throw new Error('Le plan de lissage est invalide ou incomplet.');
    }
  }
}
