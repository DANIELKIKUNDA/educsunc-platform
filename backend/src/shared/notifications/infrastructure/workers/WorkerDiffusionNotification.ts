// Ce fichier declare le worker de diffusion technique du moteur Notifications.

import { PortMonitoringNotification } from '../../application';
import { RegistreNotificationsMemoire } from '../persistence';
import { FileDeadLetterNotifications, FileNotifications, JobFileNotification } from '../queues';
import { ChargeLivraisonNotification, RegistreProvidersNotification } from '../providers';
import {
  DetailExecutionWorkerNotification,
  ResultatExecutionWorkerNotification,
} from './TypesWorkersNotifications';

/** Cette classe consomme la file principale et appelle le provider technique approprie. */
export class WorkerDiffusionNotification {
  /** Ce constructeur assemble les dependances techniques de diffusion. */
  constructor(
    private readonly fileNotifications: FileNotifications,
    private readonly registreNotificationsMemoire: RegistreNotificationsMemoire,
    private readonly registreProvidersNotification: RegistreProvidersNotification,
    private readonly fileDeadLetterNotifications: FileDeadLetterNotifications,
    private readonly portMonitoringNotification: PortMonitoringNotification,
  ) {}

  /** Cette methode execute un cycle de diffusion sur un lot limite de jobs. */
  public async executerCycle(limite = 25): Promise<ResultatExecutionWorkerNotification> {
    const details: DetailExecutionWorkerNotification[] = [];

    while (details.length < limite) {
      const job = this.fileNotifications.extraireProchainDisponible();
      if (!job) {
        break;
      }

      details.push(await this.executerJob(job));
    }

    return this.construireResultat(details);
  }

  /** Cette methode execute un job unique de diffusion technique. */
  private async executerJob(job: JobFileNotification): Promise<DetailExecutionWorkerNotification> {
    const enregistrement = this.registreNotificationsMemoire.enregistrements.get(job.identifiantNotification);
    if (!enregistrement) {
      await this.fileDeadLetterNotifications.placer(job, 'Notification introuvable dans le registre technique.');
      await this.portMonitoringNotification.enregistrerSignal('notifications.dispatch.failed', {
        notificationId: job.identifiantNotification,
        raison: 'snapshot-introuvable',
      });
      return {
        identifiantNotification: job.identifiantNotification,
        succes: false,
        message: 'Le snapshot technique de notification est introuvable.',
        metadata: {
          typeErreur: 'SNAPSHOT_INTROUVABLE',
        },
      };
    }

    const canal = enregistrement.canaux[0];
    if (!canal) {
      await this.fileDeadLetterNotifications.placer(job, 'Aucun canal technique disponible pour la notification.');
      await this.portMonitoringNotification.enregistrerSignal('notifications.dispatch.failed', {
        notificationId: job.identifiantNotification,
        raison: 'canal-introuvable',
      });
      return {
        identifiantNotification: job.identifiantNotification,
        succes: false,
        message: 'Aucun canal technique n est disponible pour cette notification.',
        metadata: {
          typeErreur: 'CANAL_INTROUVABLE',
        },
      };
    }

    const provider = this.registreProvidersNotification.resoudrePrincipal(canal);
    if (!provider) {
      await this.fileDeadLetterNotifications.placer(job, `Aucun provider principal n est enregistre pour le canal ${canal}.`);
      await this.portMonitoringNotification.enregistrerSignal('notifications.dispatch.failed', {
        notificationId: job.identifiantNotification,
        raison: 'provider-introuvable',
        canal,
      });
      return {
        identifiantNotification: job.identifiantNotification,
        succes: false,
        message: `Aucun provider n est disponible pour le canal ${canal}.`,
        metadata: {
          canal,
          typeErreur: 'PROVIDER_INTROUVABLE',
        },
      };
    }

    const charge = this.construireCharge(job, enregistrement.message, enregistrement.titre, enregistrement.type, canal);
    const resultat = await provider.envoyer(charge);

    if (!resultat.succes) {
      await this.fileDeadLetterNotifications.placer(job, resultat.erreur ?? 'Le provider a retourne un echec technique.');
      await this.portMonitoringNotification.enregistrerSignal('notifications.dispatch.failed', {
        notificationId: job.identifiantNotification,
        canal,
        provider: provider.obtenirNom(),
        erreur: resultat.erreur,
      });
      return {
        identifiantNotification: job.identifiantNotification,
        succes: false,
        message: resultat.erreur ?? 'La diffusion technique a echoue.',
        metadata: {
          canal,
          provider: provider.obtenirNom(),
        },
      };
    }

    await this.portMonitoringNotification.enregistrerSignal('notifications.dispatch.executed', {
      notificationId: job.identifiantNotification,
      canal,
      provider: provider.obtenirNom(),
    });
    return {
      identifiantNotification: job.identifiantNotification,
      succes: true,
      message: 'La diffusion technique a ete executee.',
      metadata: {
        canal,
        provider: provider.obtenirNom(),
        identifiantLivraison: resultat.identifiantLivraison,
      },
    };
  }

  /** Cette methode construit la charge technique remise au provider de canal. */
  private construireCharge(
    job: JobFileNotification,
    message: string,
    sujet: string | undefined,
    typeNotification: ChargeLivraisonNotification['typeNotification'],
    canal: ChargeLivraisonNotification['canal'],
  ): ChargeLivraisonNotification {
    return {
      identifiantNotification: job.identifiantNotification,
      typeNotification,
      canal,
      destinataire: (job.metadata.destinataire as string | undefined) ?? 'destinataire-technique',
      sujet,
      message,
      metadata: { ...job.metadata },
      correlationId: job.correlationId,
      requestId: job.requestId,
      organisationId: job.organisationId,
      ecoleId: job.ecoleId,
      criticite: ((job.metadata.criticite as ChargeLivraisonNotification['criticite']) ?? 'BEST_EFFORT'),
    };
  }

  /** Cette methode construit le resultat consolide du cycle worker. */
  private construireResultat(
    details: readonly DetailExecutionWorkerNotification[],
  ): ResultatExecutionWorkerNotification {
    const totalSucces = details.filter((detail) => detail.succes).length;
    return {
      typeWorker: 'DIFFUSION',
      succes: details.every((detail) => detail.succes),
      totalTraites: details.length,
      totalSucces,
      totalEchecs: details.length - totalSucces,
      executeLe: new Date(),
      details,
      metadata: {},
    };
  }
}
