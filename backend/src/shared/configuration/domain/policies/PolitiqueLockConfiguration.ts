import { NiveauConfiguration } from '../enums';
import { ConfigurationLock } from '../entities';
import { ConfigurationScope } from '../value-objects';

// Ce fichier declare la politique de verrouillage de configuration.

/** Cette classe centralise les regles de verrou metier. */
export class PolitiqueLockConfiguration {
  /** Cette methode indique si une portee donnee peut encore modifier une cle verrouillee. */
  public autoriserModification(
    lock: ConfigurationLock | null,
    scope: ConfigurationScope,
  ): boolean {
    if (!lock) {
      return true;
    }

    const niveauMinimalAutorise = lock.valeur().niveauMinimalAutorise;
    return this.priorite(scope.niveau()) <= this.priorite(niveauMinimalAutorise);
  }

  /** Cette methode convertit un niveau en priorite stable. */
  private priorite(niveau: NiveauConfiguration): number {
    return {
      SYSTEM: 0,
      ORGANIZATION: 1,
      SCHOOL: 2,
      USER: 3,
    }[niveau];
  }
}
