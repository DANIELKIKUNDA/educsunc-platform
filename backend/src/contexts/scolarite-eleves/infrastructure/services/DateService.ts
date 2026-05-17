// Ce fichier contient un service technique simple pour centraliser l'acces a la date courante.

// Ce service fournit les dates techniques utilisees par l'infrastructure locale.
export class DateService {
  // Cette methode retourne l'instant courant.
  public maintenant(): Date {
    return new Date();
  }

  // Cette methode retourne une date ISO a partir d'un objet Date.
  public formaterIso(date: Date): string {
    return date.toISOString();
  }
}
