import { randomUUID } from 'node:crypto';
import type { HealthSnapshotDto, MonitoringContextInputDto } from '../dto';
import { ApplicationAlertMonitoringService } from './ApplicationAlertMonitoringService';

/**
 * Transforme uniquement des etats techniques effectivement observes en alertes.
 * Aucun seuil de performance arbitraire n'est invente ici : les sondes/collecteurs
 * restent proprietaires de leurs seuils documentes et publient HEALTHY/DEGRADED/CRITICAL/UNKNOWN.
 */
export class ApplicationAlertingEngineService {
  constructor(private readonly alertes: ApplicationAlertMonitoringService) {}

  public async reconciler(snapshot: HealthSnapshotDto, contexte: MonitoringContextInputDto): Promise<void> {
    const observations = [
      ...snapshot.etat.composants.map((c) => ({
        cle: `health.component.${c.nom}`,
        composant: c.nom,
        niveau: c.niveau,
        message: c.message,
      })),
      ...snapshot.etat.dependances.map((d) => ({
        cle: `health.dependency.${d.nom}`,
        composant: d.nom,
        niveau: d.niveau,
        message: d.message,
      })),
      {
        cle: 'health.runtime',
        composant: 'runtime',
        niveau: snapshot.etat.runtime.niveau,
        message: `Runtime ${snapshot.etat.runtime.niveau}; jobs=${snapshot.etat.runtime.jobsEnCours}; backlog=${snapshot.etat.runtime.jobsEnRetard}`,
      },
    ] as const;

    const actives = (await this.alertes.listerEntites()).filter((a) => {
      const p = a.valeur();
      return p.statut !== 'RESOLVED' && p.statut !== 'SUPPRESSED';
    });

    for (const observation of observations) {
      const existante = actives.find((a) => {
        const p = a.valeur();
        return p.indicateur === observation.cle && p.contexte.composant === observation.composant;
      });

      if (observation.niveau === 'HEALTHY' || observation.niveau === 'UNKNOWN') {
        if (existante && observation.niveau === 'HEALTHY') {
          await this.alertes.resoudre({ alertId: existante.valeur().identifiant, resolvedAt: new Date() });
        }
        continue;
      }

      if (existante) continue;

      // Echelle binaire de sante : DEGRADED=1, CRITICAL=2. Elle ne remplace pas
      // les seuils metriques ; elle materialise le niveau deja calcule par la sonde.
      const valeurObservee = observation.niveau === 'CRITICAL' ? 2 : 1;
      await this.alertes.creer({
        alertId: `auto-${randomUUID()}`,
        indicateur: observation.cle,
        warning: 1,
        critical: 2,
        unite: 'health-level',
        valeurObservee,
        message: observation.message,
        contexte: { ...contexte, composant: observation.composant },
        correlationId: contexte.correlationId ?? randomUUID(),
      });
    }
  }
}
