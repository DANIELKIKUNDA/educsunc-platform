// Ce fichier declare le noyau technique de planification du module Notifications.

import { randomUUID } from 'node:crypto';
import { PortMonitoringNotification } from '../../application';

/** Cette union represente les familles de taches planifiables du runtime Notifications. */
export type TypeTachePlanifieeNotification =
  | 'DISPATCH'
  | 'EXPIRATION'
  | 'ARCHIVAGE'
  | 'CLEANUP'
  | 'RECOVERY';

/** Cette interface represente une tache technique planifiee dans le runtime local. */
export interface TachePlanifieeNotification {
  readonly identifiantTache: string;
  readonly typeTache: TypeTachePlanifieeNotification;
  readonly identifiantNotification?: string;
  readonly executeLe: Date;
  readonly creeLe: Date;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/** Cette interface represente un snapshot lisible de la planification runtime. */
export interface SnapshotPlanificationNotifications {
  readonly totalTaches: number;
  readonly tachesEnRetard: number;
  readonly tachesParType: Readonly<Record<TypeTachePlanifieeNotification, number>>;
  readonly collecteLe: Date;
}

/** Cette classe centralise la planification technique locale des taches runtime Notifications. */
export class PlanificateurNotifications {
  /** Cette file conserve les taches planifiees encore actives dans le runtime local. */
  private readonly taches: TachePlanifieeNotification[] = [];

  /** Ce constructeur relie le scheduler au monitoring technique. */
  constructor(private readonly portMonitoringNotification: PortMonitoringNotification) {}

  /** Cette methode planifie une tache technique a une date donnee. */
  public async planifier(
    typeTache: TypeTachePlanifieeNotification,
    executeLe: Date,
    identifiantNotification?: string,
    metadata: Readonly<Record<string, unknown>> = {},
  ): Promise<TachePlanifieeNotification> {
    const tache: TachePlanifieeNotification = {
      identifiantTache: randomUUID(),
      typeTache,
      identifiantNotification,
      executeLe,
      creeLe: new Date(),
      metadata: { ...metadata },
    };

    this.taches.push(tache);
    this.taches.sort((gauche, droite) => gauche.executeLe.getTime() - droite.executeLe.getTime());

    await this.portMonitoringNotification.enregistrerSignal('notifications.scheduler.planned', {
      typeTache,
      identifiantNotification,
      executeLe,
    });

    return tache;
  }

  /** Cette methode retourne les prochaines taches disponibles sans les retirer. */
  public lireDisponibles(
    typeTache?: TypeTachePlanifieeNotification,
    maintenant = new Date(),
  ): TachePlanifieeNotification[] {
    return this.taches.filter((tache) => {
      if (tache.executeLe.getTime() > maintenant.getTime()) {
        return false;
      }
      return typeTache ? tache.typeTache === typeTache : true;
    });
  }

  /** Cette methode extrait les prochaines taches disponibles du scheduler local. */
  public async extraireDisponibles(
    typeTache?: TypeTachePlanifieeNotification,
    maintenant = new Date(),
  ): Promise<TachePlanifieeNotification[]> {
    const extraites: TachePlanifieeNotification[] = [];

    for (let index = this.taches.length - 1; index >= 0; index -= 1) {
      const tache = this.taches[index];
      if (tache.executeLe.getTime() > maintenant.getTime()) {
        continue;
      }
      if (typeTache && tache.typeTache !== typeTache) {
        continue;
      }
      extraites.push(tache);
      this.taches.splice(index, 1);
    }

    extraites.reverse();

    if (extraites.length > 0) {
      await this.portMonitoringNotification.enregistrerSignal('notifications.scheduler.extracted', {
        typeTache: typeTache ?? 'ALL',
        total: extraites.length,
      });
    }

    return extraites;
  }

  /** Cette methode annule une tache planifiee si elle existe encore. */
  public async annuler(identifiantTache: string): Promise<boolean> {
    const index = this.taches.findIndex((tache) => tache.identifiantTache === identifiantTache);
    if (index < 0) {
      return false;
    }

    const [tache] = this.taches.splice(index, 1);
    await this.portMonitoringNotification.enregistrerSignal('notifications.scheduler.cancelled', {
      typeTache: tache?.typeTache,
      identifiantTache,
    });
    return true;
  }

  /** Cette methode retourne un snapshot global de la planification runtime locale. */
  public observer(maintenant = new Date()): SnapshotPlanificationNotifications {
    const tachesParType: Record<TypeTachePlanifieeNotification, number> = {
      DISPATCH: 0,
      EXPIRATION: 0,
      ARCHIVAGE: 0,
      CLEANUP: 0,
      RECOVERY: 0,
    };

    for (const tache of this.taches) {
      tachesParType[tache.typeTache] += 1;
    }

    return {
      totalTaches: this.taches.length,
      tachesEnRetard: this.taches.filter((tache) => tache.executeLe.getTime() <= maintenant.getTime()).length,
      tachesParType,
      collecteLe: maintenant,
    };
  }
}
