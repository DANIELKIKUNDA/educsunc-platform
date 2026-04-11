// Encapsule la planification des taches techniques backend.
export interface Scheduler {
  enregistrer(nom: string, cron: string): Promise<void>;
}
