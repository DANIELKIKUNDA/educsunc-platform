import { AuditEntry } from '../aggregates';

// Ce moteur reconstruit des timelines de ressources, d'utilisateurs ou de workflows.
export class MoteurHistorisationAudit {
  public trierChronologiquement(entrees: AuditEntry[]): AuditEntry[] {
    return [...entrees].sort(
      (gauche, droite) =>
        gauche.obtenirHorodatageAudit().obtenirDateAction().getTime()
        - droite.obtenirHorodatageAudit().obtenirDateAction().getTime(),
    );
  }
}
