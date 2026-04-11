const gelerProprietes = <T>(proprietes: T): T => {
  if (proprietes !== null && typeof proprietes === 'object') {
    return Object.freeze(proprietes);
  }

  return proprietes;
};

// Un objet valeur est defini par ses proprietes et non par une identite propre.
export abstract class ObjetValeur<T> {
  protected proprietes: T;

  // Le constructeur stocke les proprietes sous une forme immuable.
  constructor(proprietes: T) {
    this.proprietes = gelerProprietes(proprietes);
  }

  // Deux objets valeur sont egaux si leur contenu serialise est identique.
  public estEgal(objet?: ObjetValeur<T>): boolean {
    if (objet === null || objet === undefined) {
      return false;
    }

    return JSON.stringify(this.proprietes) === JSON.stringify(objet.proprietes);
  }
}
