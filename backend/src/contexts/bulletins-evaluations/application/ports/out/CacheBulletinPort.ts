// Ce port abstrait la mise en cache applicative des lectures optimisees.
export interface CacheBulletinPort {
  obtenir<T>(cle: string): Promise<T | null>;
  enregistrer<T>(cle: string, valeur: T, ttlSecondes?: number): Promise<void>;
  invalider(cle: string): Promise<void>;
}
