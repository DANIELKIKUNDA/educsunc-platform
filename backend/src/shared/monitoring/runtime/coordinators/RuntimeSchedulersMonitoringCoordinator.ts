// Ce fichier declare le coordinateur runtime des schedulers Monitoring.

export class RuntimeSchedulersMonitoringCoordinator {
  private readonly schedulers = new Set<string>();

  public enregistrer(nom: string): void {
    this.schedulers.add(nom);
  }

  public lister(): readonly string[] {
    return [...this.schedulers];
  }
}
