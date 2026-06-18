import { EntreeChronologieNotification, TentativeLivraison } from '../entites';

/** Ce service reconstruit ou trie la chronology d'une notification. */
export class ServiceChronologieNotification {
  /** Cette methode trie les entrees de chronology dans l'ordre croissant. */
  public static trier(entrees: readonly EntreeChronologieNotification[]): EntreeChronologieNotification[] {
    return [...entrees].sort((gauche, droite) => gauche.obtenirHorodatage().getTime() - droite.obtenirHorodatage().getTime());
  }
}

/** Ce service produit un resume forensic simple a partir des traces du domaine. */
export class ServiceForensicNotification {
  /** Cette methode reconstruit un petit resume investigable de l'etat de notification. */
  public static reconstruireResume(
    entrees: readonly EntreeChronologieNotification[],
    tentatives: readonly TentativeLivraison[],
  ): Record<string, unknown> {
    return {
      nombreEntrees: entrees.length,
      nombreTentatives: tentatives.length,
      dernierEvenement: entrees.at(-1)?.obtenirTypeEvenement(),
      dernierCanal: tentatives.at(-1)?.obtenirCanal(),
    };
  }
}
