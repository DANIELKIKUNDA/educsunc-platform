// Une entite DDD est definie par une identite stable qui permet de la reconnaitre dans le temps.
export abstract class Entite<T> {
  protected id: T;

  // Le constructeur initialise l'identifiant unique porte par l'entite.
  constructor(id: T) {
    this.id = id;
  }

  // Cette methode expose l'identifiant sans reveler directement la propriete.
  public obtenirId(): T {
    return this.id;
  }

  // Deux entites sont egales si elles portent le meme identifiant.
  public estEgal(objet?: Entite<T>): boolean {
    if (objet === null || objet === undefined) {
      return false;
    }

    return this.id === objet.obtenirId();
  }
}
