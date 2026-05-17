// Cette policy determine si un eleve doit etre marque non classe.
export class PolicyNonClasse {
  // Cette methode retourne vrai si une cote obligatoire manque sur un cours calculable.
  public verifier(coteObligatoireManquante: boolean): boolean {
    return coteObligatoireManquante;
  }
}
