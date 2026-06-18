import type { SystemStateDto } from '../../application';

// Ce fichier declare le cache local d etat systeme.

/** Cette classe represente le cache memoire de l etat systeme. */
export class CacheEtatSystemeMonitoring {
  private etat: SystemStateDto | null = null;

  /** Cette methode memorise un etat systeme. */
  public enregistrer(etat: SystemStateDto): void {
    this.etat = etat;
  }

  /** Cette methode retourne l etat systeme courant. */
  public lire(): SystemStateDto | null {
    return this.etat;
  }
}
