import { ObjetValeur } from '../../../domain/ValueObject';

// Ce value object rattache un audit à une requête runtime précise.
export class RequestId extends ObjetValeur<{ valeur?: string }> {
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
