import type { RuntimeRealtimeContext, RuntimeRealtimeSnapshot } from './RuntimeRealtimeTypes';

export class RuntimeRealtimeRegistry {
  private composants = new Map<string, object>();
  private workers = new Set<string>();
  private connexionIds = new Set<string>();
  private abonnementIds = new Set<string>();
  private demarre = false;

  constructor(private readonly contexte: RuntimeRealtimeContext) {}

  public enregistrerComposant(nom: string, composant: object): void {
    this.composants.set(nom, composant);
  }

  public enregistrerWorker(nom: string): void {
    this.workers.add(nom);
  }

  public enregistrerConnexion(id: string): void {
    this.connexionIds.add(id);
  }

  public enregistrerAbonnement(id: string): void {
    this.abonnementIds.add(id);
  }

  public retirerConnexion(id: string): void {
    this.connexionIds.delete(id);
  }

  public retirerAbonnement(id: string): void {
    this.abonnementIds.delete(id);
  }

  public demarrer(): void {
    this.demarre = true;
  }

  public arreter(): void {
    this.demarre = false;
  }

  public contexteRuntime(): RuntimeRealtimeContext {
    return this.contexte;
  }

  public snapshot(): RuntimeRealtimeSnapshot {
    return {
      nom: this.contexte.nom,
      demarre: this.demarre,
      connexionCount: this.connexionIds.size,
      abonnementCount: this.abonnementIds.size,
      workerCount: this.workers.size,
      composantCount: this.composants.size,
    };
  }
}
