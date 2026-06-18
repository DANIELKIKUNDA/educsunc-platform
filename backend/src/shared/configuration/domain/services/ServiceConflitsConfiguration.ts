import { ConfigurationScope } from '../value-objects';

// Ce fichier declare le service de conflits.

/** Cette classe centralise la detection simple de conflits de portee. */
export class ServiceConflitsConfiguration {
  /** Cette methode indique si deux portees entrent en conflit direct. */
  public detecter(source: ConfigurationScope, cible: ConfigurationScope): boolean {
    const a = source.valeur();
    const b = cible.valeur();
    return Boolean(
      (a.organisationId && b.organisationId && a.organisationId !== b.organisationId)
      || (a.ecoleId && b.ecoleId && a.ecoleId !== b.ecoleId),
    );
  }
}
