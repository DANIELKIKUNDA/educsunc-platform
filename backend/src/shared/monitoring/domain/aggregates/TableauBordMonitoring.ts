import { Alerte, CapaciteSysteme, DiagnosticIncident, Saturation } from '../entities';
import { EtatSysteme } from './EtatSysteme';
import { IncidentSysteme } from './IncidentSysteme';

// Ce fichier declare l agregat de tableau de bord consolide.

/** Cette interface represente la vue serialisable d un tableau de bord Monitoring. */
export interface TableauBordMonitoringDetails {
  readonly etatSysteme: ReturnType<EtatSysteme['details']>;
  readonly alertes: readonly ReturnType<Alerte['valeur']>[];
  readonly incidents: readonly ReturnType<IncidentSysteme['details']>[];
  readonly diagnostics: readonly ReturnType<DiagnosticIncident['valeur']>[];
  readonly capacites: readonly ReturnType<CapaciteSysteme['valeur']>[];
  readonly saturations: readonly ReturnType<Saturation['valeur']>[];
}

/** Cette classe represente une vue consolidee du systeme. */
export class TableauBordMonitoring {
  constructor(
    private readonly etatSysteme: EtatSysteme,
    private readonly alertes: readonly Alerte[],
    private readonly incidents: readonly IncidentSysteme[],
    private readonly diagnostics: readonly DiagnosticIncident[],
    private readonly capacites: readonly CapaciteSysteme[],
    private readonly saturations: readonly Saturation[],
  ) {}

  /** Cette methode retourne la vue serialisable du tableau de bord. */
  public details(): TableauBordMonitoringDetails {
    return {
      etatSysteme: this.etatSysteme.details(),
      alertes: this.alertes.map((alerte) => alerte.valeur()),
      incidents: this.incidents.map((incident) => incident.details()),
      diagnostics: this.diagnostics.map((diagnostic) => diagnostic.valeur()),
      capacites: this.capacites.map((capacite) => capacite.valeur()),
      saturations: this.saturations.map((saturation) => saturation.valeur()),
    };
  }
}
