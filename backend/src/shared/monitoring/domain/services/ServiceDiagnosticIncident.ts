import { DiagnosticIncident, TraceOperation } from '../entities';
import { IncidentSysteme } from '../aggregates';

// Ce fichier declare le service de generation de diagnostic incident.

/** Cette classe represente le service de diagnostic des incidents. */
export class ServiceDiagnosticIncident {
  /** Cette methode produit un diagnostic de premier niveau a partir d un incident et de ses traces. */
  public generer(incident: IncidentSysteme, traces: readonly TraceOperation[]): DiagnosticIncident {
    const details = incident.details();
    const causesProbables = traces.length > 0
      ? traces.map((trace) => `${trace.valeur().operation}:${trace.valeur().succes ? 'ok' : 'ko'}`)
      : ['Aucune trace correlee disponible'];

    return new DiagnosticIncident({
      incidentId: details.identifiant,
      resume: details.resume,
      causesProbables,
      recommandations: details.alertes.length > 0
        ? ['Verifier les composants critiques', 'Valider les dependances et la saturation']
        : ['Poursuivre l analyse forensique'],
      niveau: details.niveau,
      contexte: details.contexte,
      correlation: details.correlation,
      genereLe: new Date(),
    });
  }
}
