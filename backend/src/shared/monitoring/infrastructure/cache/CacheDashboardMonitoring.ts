import type { DashboardMonitoringDto } from '../../application';

// Ce fichier declare le cache local de tableau de bord.

/** Cette classe represente le cache memoire du tableau de bord Monitoring. */
export class CacheDashboardMonitoring {
  private dashboard: DashboardMonitoringDto | null = null;

  /** Cette methode memorise un tableau de bord. */
  public enregistrer(dashboard: DashboardMonitoringDto): void {
    this.dashboard = dashboard;
  }

  /** Cette methode retourne le tableau de bord courant. */
  public lire(): DashboardMonitoringDto | null {
    return this.dashboard;
  }
}
