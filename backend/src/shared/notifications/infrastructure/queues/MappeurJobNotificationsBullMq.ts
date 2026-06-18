import type { JobBullMqShared } from 'shared/infrastructure/queues/bullmq';
import { ChargeDeadLetterNotificationBullMq, ChargeJobNotificationBullMq } from './TypesJobsNotificationsBullMq';
import { JobDeadLetterNotification, JobFileNotification } from './TypesFilesNotifications';

// Ce fichier convertit les jobs BullMQ partages vers les contrats techniques Notifications et inversement.

/** Cette classe centralise le mapping des payloads BullMQ du module Notifications. */
export class MappeurJobNotificationsBullMq {
  /** Cette methode convertit un contrat Notifications en payload BullMQ. */
  public static versCharge(
    typeFile: JobFileNotification['typeFile'],
    identifiantNotification: string,
    metadata: Readonly<Record<string, unknown>>,
    tentative = 0,
    delaiMs = 0,
  ): ChargeJobNotificationBullMq {
    return {
      identifiantNotification,
      typeFile,
      organisationId: metadata.organisationId as string | undefined,
      ecoleId: metadata.ecoleId as string | undefined,
      correlationId: metadata.correlationId as string | undefined,
      requestId: metadata.requestId as string | undefined,
      priorite: metadata.prioriteJob as JobFileNotification['priorite'] | undefined,
      metadata: { ...metadata },
      tentative,
      creeLe: new Date().toISOString(),
      disponibleLe: new Date(Date.now() + delaiMs).toISOString(),
    };
  }

  /** Cette methode convertit un payload BullMQ partage en job Notifications lisible. */
  public static depuisJobShared(
    job: JobBullMqShared<ChargeJobNotificationBullMq>,
  ): JobFileNotification {
    return {
      identifiantJob: job.id,
      identifiantNotification: job.charge.identifiantNotification,
      typeFile: job.charge.typeFile,
      organisationId: job.charge.organisationId,
      ecoleId: job.charge.ecoleId,
      correlationId: job.charge.correlationId,
      requestId: job.charge.requestId,
      priorite: job.charge.priorite,
      metadata: { ...job.charge.metadata },
      tentative: job.charge.tentative,
      creeLe: new Date(job.charge.creeLe),
      disponibleLe: new Date(job.charge.disponibleLe),
    };
  }

  /** Cette methode construit une charge dead letter a partir d un job technique. */
  public static versDeadLetter(
    job: JobFileNotification,
    raisonDeadLetter: string,
  ): ChargeDeadLetterNotificationBullMq {
    return {
      ...this.versCharge(
        'DEAD_LETTER',
        job.identifiantNotification,
        job.metadata,
        job.tentative,
        Math.max(0, job.disponibleLe.getTime() - Date.now()),
      ),
      raisonDeadLetter,
      deadLetterLe: new Date().toISOString(),
    };
  }

  /** Cette methode convertit un job BullMQ partage en dead letter Notifications. */
  public static depuisDeadLetterShared(
    job: JobBullMqShared<ChargeDeadLetterNotificationBullMq>,
  ): JobDeadLetterNotification {
    return {
      ...this.depuisJobShared(job as JobBullMqShared<ChargeJobNotificationBullMq>),
      typeFile: 'DEAD_LETTER',
      raisonDeadLetter: job.charge.raisonDeadLetter,
      deadLetterLe: new Date(job.charge.deadLetterLe),
    };
  }
}
