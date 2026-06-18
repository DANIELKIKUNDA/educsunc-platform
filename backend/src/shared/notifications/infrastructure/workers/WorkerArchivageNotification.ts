// Ce fichier declare le worker d'archivage technique du moteur Notifications.

import { PortMonitoringNotification } from '../../application';
import { RegistreNotificationsMemoire } from '../persistence';
import { StockageReplayNotification } from '../replay';
import {
  GestionCycleVieStockageNotifications,
  StockageArchiveNotifications,
} from '../storage';
import {
  DetailExecutionWorkerNotification,
  ResultatExecutionWorkerNotification,
} from './TypesWorkersNotifications';

/** Cette classe archive les notifications terminales et consolide leurs vues techniques. */
export class WorkerArchivageNotification {
  /** Ce constructeur assemble les dependances techniques de l'archivage. */
  constructor(
    private readonly registreNotificationsMemoire: RegistreNotificationsMemoire,
    private readonly stockageReplayNotification: StockageReplayNotification,
    private readonly gestionCycleVieStockageNotifications: GestionCycleVieStockageNotifications,
    private readonly stockageArchiveNotifications: StockageArchiveNotifications,
    private readonly portMonitoringNotification: PortMonitoringNotification,
  ) {}

  /** Cette methode execute un cycle d'archivage sur les snapshots eligibles. */
  public async executerCycle(
    limite = 50,
    raisonArchivage = 'worker-archivage',
  ): Promise<ResultatExecutionWorkerNotification> {
    const details: DetailExecutionWorkerNotification[] = [];
    const eligibles = [...this.registreNotificationsMemoire.enregistrements.values()].filter((enregistrement) =>
      enregistrement.statut === 'ARCHIVED' || Boolean(enregistrement.dateArchivage),
    );

    for (const enregistrement of eligibles.slice(0, limite)) {
      details.push(await this.archiver(enregistrement.identifiant, raisonArchivage));
    }

    const totalSucces = details.filter((detail) => detail.succes).length;
    return {
      typeWorker: 'ARCHIVAGE',
      succes: details.every((detail) => detail.succes),
      totalTraites: details.length,
      totalSucces,
      totalEchecs: details.length - totalSucces,
      executeLe: new Date(),
      details,
      metadata: {},
    };
  }

  /** Cette methode archive une notification terminale si elle n est pas deja archivee. */
  private async archiver(
    identifiantNotification: string,
    raisonArchivage: string,
  ): Promise<DetailExecutionWorkerNotification> {
    const dejaArchivee = this.stockageArchiveNotifications.lire(identifiantNotification);
    if (dejaArchivee) {
      return {
        identifiantNotification,
        succes: true,
        message: 'La notification etait deja archivee.',
        metadata: {
          dejaArchivee: true,
        },
      };
    }

    const enregistrement = this.registreNotificationsMemoire.enregistrements.get(identifiantNotification);
    if (!enregistrement) {
      return {
        identifiantNotification,
        succes: false,
        message: 'Le snapshot technique a archiver est introuvable.',
        metadata: {},
      };
    }

    const historiqueReplay = this.stockageReplayNotification.lireHistorique(identifiantNotification);
    const chronologyCount =
      this.registreNotificationsMemoire.projectionsChronologie.get(identifiantNotification)?.length ??
      this.registreNotificationsMemoire.chronologies.get(identifiantNotification)?.length ??
      0;

    this.gestionCycleVieStockageNotifications.archiver(
      enregistrement,
      chronologyCount,
      historiqueReplay,
      raisonArchivage,
    );
    await this.portMonitoringNotification.enregistrerSignal('notifications.archival.executed', {
      notificationId: identifiantNotification,
      chronologyCount,
      totalReplay: historiqueReplay.length,
    });

    return {
      identifiantNotification,
      succes: true,
      message: 'La notification a ete archivee techniquement.',
      metadata: {
        chronologyCount,
        totalReplay: historiqueReplay.length,
      },
    };
  }
}
