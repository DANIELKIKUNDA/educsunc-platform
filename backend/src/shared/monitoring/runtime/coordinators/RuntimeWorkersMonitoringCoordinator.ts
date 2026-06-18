// Ce fichier declare le coordinateur runtime des workers Monitoring.

export class RuntimeWorkersMonitoringCoordinator {
  private readonly workers = new Set<string>();

  public enregistrer(nom: string): void {
    this.workers.add(nom);
  }

  public lister(): readonly string[] {
    return [...this.workers];
  }
}
