import { ObjetValeur } from '../../../domain/ValueObject';

// Ce value object relie plusieurs audits d'une même opération globale.
export class CorrelationId extends ObjetValeur<{ valeur?: string }> {
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
}
