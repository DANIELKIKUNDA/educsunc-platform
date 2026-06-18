import type { RuntimeMonitoringContext, RuntimeMonitoringSnapshot } from './RuntimeMonitoringTypes';

// Ce fichier declare le registre runtime Monitoring.

export class RuntimeMonitoringRegistry {
  private composants = new Map<string, object>();
  private workers = new Set<string>();
  private schedulers = new Set<string>();
  private demarre = false;

  constructor(private readonly contexte: RuntimeMonitoringContext) {}

  public enregistrerComposant(nom: string, composant: object): void {
    this.composants.set(nom, composant);
  }

  public enregistrerWorker(nom: string): void {
    this.workers.add(nom);
  }

  public enregistrerScheduler(nom: string): void {
    this.schedulers.add(nom);
  }

  public demarrer(): void {
    this.demarre = true;
  }

  public arreter(): void {
    this.demarre = false;
  }

  public snapshot(): RuntimeMonitoringSnapshot {
    return {
      nom: 'monitoring-runtime',
      demarre: this.demarre,
      composantCount: this.composants.size,
      schedulerCount: this.schedulers.size,
      workerCount: this.workers.size,
    };
  }

  public contexteRuntime(): RuntimeMonitoringContext {
    return this.contexte;
  }
}
