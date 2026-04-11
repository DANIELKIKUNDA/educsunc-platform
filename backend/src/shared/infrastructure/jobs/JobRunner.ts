// Encapsule l'execution technique des jobs backend.
export interface JobRunner {
  executer(nom: string, charge?: Record<string, unknown>): Promise<void>;
}
