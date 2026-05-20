// Ce fichier regroupe les doublures transverses simples des tests globaux.

export class NotificationMock {
  public readonly messages: Array<{ cible: string; contenu: string }> = [];

  public envoyer(cible: string, contenu: string): void {
    this.messages.push({ cible, contenu });
  }
}

export class CacheMock {
  private readonly stock = new Map<string, unknown>();

  public memoriser(cle: string, valeur: unknown): void {
    this.stock.set(cle, valeur);
  }

  public lire<TValeur>(cle: string): TValeur | null {
    return (this.stock.get(cle) as TValeur | undefined) ?? null;
  }

  public vider(): void {
    this.stock.clear();
  }
}
