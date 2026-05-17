// Cette policy verifie la coherence globale des statistiques d'une proclamation.
export class PolicyStatistiquesProclamation {
  // Cette methode valide qu'un total reste coherent avec ses composantes.
  public verifier(totalAttendu: number, valeurs: number[]): void {
    const somme = valeurs.reduce((courant, valeur) => courant + valeur, 0);

    if (somme !== totalAttendu) {
      throw new Error('Les statistiques de proclamation sont incoherentes.');
    }
  }
}
