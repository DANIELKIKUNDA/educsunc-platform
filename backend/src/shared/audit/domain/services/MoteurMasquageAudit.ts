import { MasquageDonneesSensibles } from '../value-objects';

// Ce moteur nettoie les données avant qu'elles n'entrent dans l'historique officiel.
export class MoteurMasquageAudit {
  private readonly masquage = new MasquageDonneesSensibles();

  public nettoyer(snapshot?: Record<string, unknown>): Record<string, unknown> | undefined {
    return this.masquage.nettoyer(snapshot);
  }
}
