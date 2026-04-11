// Ce service definit une abstraction du cache afin d'isoler l'application de la technologie de stockage choisie.
export interface ServiceCache {
  // Cette methode tente de recuperer une valeur a partir d'une cle.
  recuperer(cle: string): Promise<any | null>;

  // Cette methode enregistre une valeur dans le cache avec une duree de vie optionnelle.
  enregistrer(cle: string, valeur: any, ttl?: number): Promise<void>;

  // Cette methode supprime une entree du cache.
  supprimer(cle: string): Promise<void>;
}
