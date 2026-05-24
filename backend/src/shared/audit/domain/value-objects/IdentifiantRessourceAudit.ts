import { ObjetValeur } from '../../../domain/ValueObject';

// Ce value object protège l'identifiant métier de la ressource auditée.
export class IdentifiantRessourceAudit extends ObjetValeur<{ valeur?: string }> {
  constructor(valeur?: string | null) {
    const propre = String(valeur ?? '').trim();
    if (propre.length === 0) {
      super({ valeur: undefined });
      return;
    }

    super({ valeur: propre });
  }

  public obtenirValeur(): string | undefined {
    return this.proprietes.valeur;
  }

  public estRenseigne(): boolean {
    return typeof this.proprietes.valeur === 'string' && this.proprietes.valeur.length > 0;
  }
}
