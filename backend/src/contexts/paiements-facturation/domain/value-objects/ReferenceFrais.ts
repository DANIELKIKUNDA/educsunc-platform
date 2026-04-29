// Ce value object porte la reference metier detaillee d'un frais ou d'une obligation.
export class ReferenceFrais {
  private valeur: string;

  constructor(valeur: string) {
    this.valeur = ReferenceFrais.valider(valeur);
  }

  public obtenirValeur(): string {
    return this.valeur;
  }

  public estEgale(autre: ReferenceFrais): boolean {
    return this.valeur === autre.obtenirValeur();
  }

  private static valider(valeur: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error('La reference de frais est obligatoire.');
    }

    const valeurNettoyee = valeur.trim().toUpperCase();

    if (!/^[A-Z0-9_]+$/.test(valeurNettoyee)) {
      throw new Error('La reference de frais doit etre alphanumerique avec underscores.');
    }

    return valeurNettoyee;
  }
}
