// Ce dispatcher retient les taches a lancer apres commit logique pour garder les transactions courtes.
export class AuditPostCommitDispatcher {
  private readonly callbacks: Array<() => Promise<void>> = [];

  public ajouter(callback: () => Promise<void>): void {
    this.callbacks.push(callback);
  }

  public async executerTous(): Promise<void> {
    for (const callback of this.callbacks) {
      await callback();
    }
    this.callbacks.length = 0;
  }

  public vider(): void {
    this.callbacks.length = 0;
  }
}

