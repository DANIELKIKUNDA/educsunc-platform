// Le pattern Result encapsule un succes ou un echec pour rendre les retours explicites et faciles a manipuler.
export class Resultat<T> {
  private succes: boolean;
  private erreur?: string;
  private valeur?: T;

  // Le constructeur prive garantit un etat coherent entre succes, valeur et erreur.
  private constructor(succes: boolean, valeur?: T, erreur?: string) {
    if (succes && erreur !== undefined) {
      throw new Error("Un succes ne peut pas contenir d'erreur.");
    }

    if (!succes && valeur !== undefined) {
      throw new Error("Un echec ne peut pas contenir de valeur.");
    }

    this.succes = succes;
    this.erreur = erreur;
    this.valeur = valeur;
  }

  // Cette methode fabrique un resultat reussi avec une valeur optionnelle.
  public static succes<T>(valeur?: T): Resultat<T> {
    return new Resultat<T>(true, valeur);
  }

  // Cette methode fabrique un resultat en echec avec un message explicite.
  public static echec<T>(message: string): Resultat<T> {
    return new Resultat<T>(false, undefined, message);
  }

  // Cette methode indique si l'operation s'est terminee avec succes.
  public estSucces(): boolean {
    return this.succes;
  }

  // Cette methode indique si l'operation s'est terminee en echec.
  public estEchec(): boolean {
    return !this.succes;
  }

  // Cette methode retourne la valeur utile lorsque le resultat est un succes.
  public obtenirValeur(): T {
    if (this.estEchec()) {
      throw new Error("Impossible d'obtenir la valeur d'un resultat en echec.");
    }

    return this.valeur as T;
  }

  // Cette methode retourne le message d'erreur lorsque le resultat est un echec.
  public obtenirErreur(): string {
    if (this.estSucces()) {
      throw new Error("Impossible d'obtenir l'erreur d'un resultat en succes.");
    }

    return this.erreur as string;
  }
}
