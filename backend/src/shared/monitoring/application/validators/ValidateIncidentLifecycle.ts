import { MonitoringValidationException } from '../exceptions';

// Ce fichier declare le validateur de cycle de vie des incidents.

/** Cette classe valide les operations sur les incidents. */
export class ValidateIncidentLifecycle {
  /** Cette methode valide un identifiant d incident. */
  public validerIncidentId(incidentId: string): void {
    if (!incidentId.trim()) {
      throw new MonitoringValidationException('Un identifiant d incident non vide est obligatoire.');
    }
  }
}
