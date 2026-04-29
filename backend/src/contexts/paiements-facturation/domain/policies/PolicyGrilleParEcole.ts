// Cette policy impose que toute tarification soit definie au niveau de l'ecole.
export class PolicyGrilleParEcole {
  public verifier(idEcole: string): void {
    if (typeof idEcole !== 'string' || idEcole.trim().length === 0) {
      throw new Error('Une grille de tarification doit obligatoirement appartenir a une ecole.');
    }
  }
}
