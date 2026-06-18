import { RuntimeMonitoringRegistry } from '../registry';
import { RuntimeSchedulersMonitoringCoordinator } from './RuntimeSchedulersMonitoringCoordinator';
import { RuntimeWorkersMonitoringCoordinator } from './RuntimeWorkersMonitoringCoordinator';

// Ce fichier declare le coordinateur principal du runtime Monitoring.

export class RuntimeMonitoringCoordinator {
  constructor(
    private readonly registry: RuntimeMonitoringRegistry,
    private readonly workers = new RuntimeWorkersMonitoringCoordinator(),
    private readonly schedulers = new RuntimeSchedulersMonitoringCoordinator(),
  ) {}

  public enregistrerWorker(nom: string): void {
    this.workers.enregistrer(nom);
    this.registry.enregistrerWorker(nom);
  }

  public enregistrerScheduler(nom: string): void {
    this.schedulers.enregistrer(nom);
    this.registry.enregistrerScheduler(nom);
  }

  public demarrer(): void {
    this.registry.demarrer();
  }

  public snapshot() {
    return this.registry.snapshot();
  }
}
