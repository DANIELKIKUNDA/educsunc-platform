import { randomUUID } from 'node:crypto';
import { Job, JobsOptions, Queue, Worker } from 'bullmq';
import {
  ClientRedisShared,
  FabriqueConnexionRedisShared,
} from '../../redis';
import type {
  ConfigurationQueueBullMqShared,
  ConfigurationWorkerBullMqShared,
  ContratQueueBullMqShared,
  ContratWorkerBullMqShared,
  EvenementQueueBullMqShared,
  JobBullMqShared,
  SnapshotQueueBullMqShared,
  StatutJobBullMqShared,
} from './TypesBullMqShared';

type EntreeQueueBullMqMemoire<TCharge> = JobBullMqShared<TCharge>;
type EntreeActiveBullMqReelleShared = {
  readonly job: Job<any, unknown, string>;
  readonly token: string;
};

// Ce fichier heberge une fabrique BullMQ partagee en mode hybride reel/simulation.

/** Cette classe construit des queues et workers BullMQ partages exploitant la vraie lib quand Redis est disponible. */
export class FabriqueBullMqShared {
  private readonly queues = new Map<string, ContratQueueBullMqShared<unknown>>();

  /** Ce constructeur accepte un client Redis partage, memoise ou injecte pour les tests. */
  constructor(
    private readonly clientRedisShared: ClientRedisShared = FabriqueConnexionRedisShared.obtenirClient(),
  ) {}

  /** Cette methode construit ou retourne une queue partagee memoisee. */
  public creerQueue<TCharge = Readonly<Record<string, unknown>>>(
    configuration: ConfigurationQueueBullMqShared,
  ): ContratQueueBullMqShared<TCharge> {
    const existante = this.queues.get(configuration.nom);
    if (existante) {
      return existante as ContratQueueBullMqShared<TCharge>;
    }

    const queue = new BullMqQueueHybrideShared<TCharge>(configuration, this.clientRedisShared);
    this.queues.set(configuration.nom, queue as ContratQueueBullMqShared<unknown>);
    return queue;
  }

  /** Cette methode construit un worker partage branche sur une queue existante. */
  public creerWorker<TCharge = Readonly<Record<string, unknown>>>(
    configuration: ConfigurationWorkerBullMqShared,
    queue: ContratQueueBullMqShared<TCharge>,
  ): ContratWorkerBullMqShared<TCharge> {
    return new BullMqWorkerMemoireShared(configuration, queue);
  }
}

/** Cette classe simule une queue BullMQ partagee tout en gardant un contrat stable. */
class BullMqQueueMemoireShared<TCharge> implements ContratQueueBullMqShared<TCharge> {
  private readonly jobs: EntreeQueueBullMqMemoire<TCharge>[] = [];
  private readonly evenements: EvenementQueueBullMqShared[] = [];

  /** Ce constructeur relie la queue a sa configuration et au client Redis partage. */
  constructor(
    private readonly configuration: ConfigurationQueueBullMqShared,
    private readonly clientRedisShared: ClientRedisShared,
  ) {}

  /** Cette methode ajoute un job normalise dans la queue partagee. */
  public async ajouter(
    nom: string,
    charge: TCharge,
    options: Readonly<Record<string, unknown>> = {},
  ): Promise<JobBullMqShared<TCharge>> {
    await this.clientRedisShared.connecter();

    const delaiMs = this.lireNombre(options.delaiMs, 0);
    const tentative = this.lireNombre(options.tentative, 0);
    const job: JobBullMqShared<TCharge> = {
      id: randomUUID(),
      nom,
      queueName: this.configuration.nom,
      charge,
      statut: delaiMs > 0 ? 'DELAYED' : 'WAITING',
      tentative,
      disponibleLe: new Date(Date.now() + delaiMs),
      creeLe: new Date(),
    };

    this.jobs.push(job);
    this.evenements.push({
      type: 'JOB_ADDED',
      queueName: this.configuration.nom,
      jobId: job.id,
      observeLe: new Date(),
      metadata: { nom },
    });

    return job;
  }

  /** Cette methode retire le prochain job disponible et le marque actif. */
  public async extraireProchainDisponible(): Promise<JobBullMqShared<TCharge> | null> {
    await this.clientRedisShared.connecter();

    const maintenant = Date.now();
    const index = this.jobs.findIndex((job) =>
      (job.statut === 'WAITING' || job.statut === 'DELAYED') &&
      job.disponibleLe.getTime() <= maintenant,
    );
    if (index < 0) {
      return null;
    }

    const job = this.jobs[index];
    const actif = this.remplacerStatut(job, 'ACTIVE');
    this.jobs[index] = actif;
    this.evenements.push({
      type: 'JOB_STARTED',
      queueName: this.configuration.nom,
      jobId: actif.id,
      observeLe: new Date(),
      metadata: {},
    });

    return actif;
  }

  /** Cette methode marque un job termine avec succes. */
  public async marquerComplete(jobId: string): Promise<void> {
    await this.marquerTerminal(jobId, 'COMPLETED');
  }

  /** Cette methode marque un job termine en echec. */
  public async marquerEchec(jobId: string, erreur: string): Promise<void> {
    await this.marquerTerminal(jobId, 'FAILED', erreur);
  }

  /** Cette methode retourne un snapshot simple de la queue partagee. */
  public observer(): SnapshotQueueBullMqShared {
    return {
      nom: this.configuration.nom,
      totalJobs: this.jobs.length,
      waiting: this.compterParStatut('WAITING'),
      active: this.compterParStatut('ACTIVE'),
      completed: this.compterParStatut('COMPLETED'),
      failed: this.compterParStatut('FAILED'),
      delayed: this.compterParStatut('DELAYED'),
    };
  }

  /** Cette methode applique un statut terminal a un job existant. */
  private async marquerTerminal(
    jobId: string,
    statut: Extract<StatutJobBullMqShared, 'COMPLETED' | 'FAILED'>,
    erreur?: string,
  ): Promise<void> {
    await this.clientRedisShared.connecter();

    const index = this.jobs.findIndex((job) => job.id === jobId);
    if (index < 0) {
      return;
    }

    const courant = this.jobs[index];
    const misAJour: JobBullMqShared<TCharge> = {
      ...courant,
      statut,
      termineLe: new Date(),
      erreur,
    };
    this.jobs[index] = misAJour;
    this.evenements.push({
      type: statut === 'COMPLETED' ? 'JOB_COMPLETED' : 'JOB_FAILED',
      queueName: this.configuration.nom,
      jobId,
      observeLe: new Date(),
      metadata: erreur ? { erreur } : {},
    });
  }

  /** Cette methode remplace le statut d un job en conservant son historique brut. */
  private remplacerStatut(
    job: JobBullMqShared<TCharge>,
    statut: StatutJobBullMqShared,
  ): JobBullMqShared<TCharge> {
    return {
      ...job,
      statut,
    };
  }

  /** Cette methode compte les jobs par statut technique. */
  private compterParStatut(statut: StatutJobBullMqShared): number {
    return this.jobs.filter((job) => job.statut === statut).length;
  }

  /** Cette methode lit un nombre optionnel avec fallback. */
  private lireNombre(valeur: unknown, fallback: number): number {
    return typeof valeur === 'number' && Number.isFinite(valeur) ? valeur : fallback;
  }
}

/** Cette classe exploite la vraie lib BullMQ quand Redis est disponible, sinon replie sur la memoire locale. */
class BullMqQueueHybrideShared<TCharge> implements ContratQueueBullMqShared<TCharge> {
  private readonly queueMemoire: BullMqQueueMemoireShared<TCharge>;
  private readonly queueReelle: Queue<any, unknown, string>;
  private readonly workerExtraction: Worker<any, unknown, string>;
  private readonly jobsActifs = new Map<string, EntreeActiveBullMqReelleShared>();
  private snapshotCourant: SnapshotQueueBullMqShared;
  private timerStalledDemarre = false;

  /** Ce constructeur prepare les variantes reelle et memoire de la queue partagee. */
  constructor(
    private readonly configuration: ConfigurationQueueBullMqShared,
    private readonly clientRedisShared: ClientRedisShared,
  ) {
    this.queueMemoire = new BullMqQueueMemoireShared(configuration, clientRedisShared);
    this.queueReelle = new Queue<any, unknown, string>(configuration.nom, {
      prefix: configuration.prefix,
      connection: this.construireConnexionBullMq(),
      defaultJobOptions: this.construireOptionsParDefaut(),
    });
    this.workerExtraction = new Worker<any, unknown, string>(
      configuration.nom,
      async () => undefined,
      {
        autorun: false,
        concurrency: 1,
        connection: this.construireConnexionBullMq(),
        prefix: configuration.prefix,
      },
    );
    this.snapshotCourant = {
      nom: configuration.nom,
      totalJobs: 0,
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
    };
  }

  /** Cette methode ajoute un job dans BullMQ ou dans le repli memoire selon le mode actif. */
  public async ajouter(
    nom: string,
    charge: TCharge,
    options: Readonly<Record<string, unknown>> = {},
  ): Promise<JobBullMqShared<TCharge>> {
    await this.clientRedisShared.connecter();
    if (this.clientRedisShared.observerEtat().modeSimulation) {
      return this.queueMemoire.ajouter(nom, charge, options);
    }

    const job = await this.queueReelle.add(nom, charge, this.construireOptionsAjout(options));
    await this.actualiserSnapshot();
    return this.mapperJobReel(job, await this.resoudreStatut(job));
  }

  /** Cette methode retire le prochain job disponible en utilisant l extraction manuelle BullMQ. */
  public async extraireProchainDisponible(): Promise<JobBullMqShared<TCharge> | null> {
    await this.clientRedisShared.connecter();
    if (this.clientRedisShared.observerEtat().modeSimulation) {
      return this.queueMemoire.extraireProchainDisponible();
    }

    await this.initialiserWorkerExtraction();
    const token = randomUUID();
    const job = await this.workerExtraction.getNextJob(token, { block: false });
    if (!job) {
      void this.actualiserSnapshot();
      return null;
    }

    const identifiantJob = String(job.id);
    this.jobsActifs.set(identifiantJob, { job, token });
    await this.actualiserSnapshot();
    return this.mapperJobReel(job, 'ACTIVE');
  }

  /** Cette methode marque un job comme complete en mode BullMQ reel ou memoire. */
  public async marquerComplete(jobId: string): Promise<void> {
    await this.clientRedisShared.connecter();
    if (this.clientRedisShared.observerEtat().modeSimulation) {
      await this.queueMemoire.marquerComplete(jobId);
      return;
    }

    const actif = this.jobsActifs.get(jobId);
    if (!actif) {
      return;
    }

    await actif.job.moveToCompleted('OK', actif.token, false);
    this.jobsActifs.delete(jobId);
    await this.actualiserSnapshot();
  }

  /** Cette methode marque un job comme echoue en mode BullMQ reel ou memoire. */
  public async marquerEchec(jobId: string, erreur: string): Promise<void> {
    await this.clientRedisShared.connecter();
    if (this.clientRedisShared.observerEtat().modeSimulation) {
      await this.queueMemoire.marquerEchec(jobId, erreur);
      return;
    }

    const actif = this.jobsActifs.get(jobId);
    if (!actif) {
      return;
    }

    await actif.job.moveToFailed(new Error(erreur), actif.token, false);
    this.jobsActifs.delete(jobId);
    await this.actualiserSnapshot();
  }

  /** Cette methode retourne le dernier snapshot connu de la queue. */
  public observer(): SnapshotQueueBullMqShared {
    if (this.clientRedisShared.observerEtat().modeSimulation) {
      return this.queueMemoire.observer();
    }

    void this.actualiserSnapshot();
    return this.snapshotCourant;
  }

  /** Cette methode initialise le worker d extraction manuelle une seule fois. */
  private async initialiserWorkerExtraction(): Promise<void> {
    if (this.timerStalledDemarre) {
      return;
    }

    await this.workerExtraction.waitUntilReady();
    await this.workerExtraction.startStalledCheckTimer();
    this.timerStalledDemarre = true;
  }

  /** Cette methode reconstruit un snapshot BullMQ lisible. */
  private async actualiserSnapshot(): Promise<void> {
    const compteurs = await this.queueReelle.getJobCounts(
      'wait',
      'active',
      'completed',
      'failed',
      'delayed',
      'prioritized',
      'waiting-children',
      'paused',
    );
    const waiting =
      (compteurs.wait ?? 0) +
      (compteurs.prioritized ?? 0) +
      (compteurs['waiting-children'] ?? 0) +
      (compteurs.paused ?? 0);

    this.snapshotCourant = {
      nom: this.configuration.nom,
      totalJobs:
        waiting +
        (compteurs.active ?? 0) +
        (compteurs.completed ?? 0) +
        (compteurs.failed ?? 0) +
        (compteurs.delayed ?? 0),
      waiting,
      active: compteurs.active ?? 0,
      completed: compteurs.completed ?? 0,
      failed: compteurs.failed ?? 0,
      delayed: compteurs.delayed ?? 0,
    };
  }

  /** Cette methode convertit le statut BullMQ natif vers le statut partage du socle. */
  private async resoudreStatut(job: Job<any, unknown, string>): Promise<StatutJobBullMqShared> {
    const etat = await job.getState();
    switch (etat) {
      case 'active':
        return 'ACTIVE';
      case 'completed':
        return 'COMPLETED';
      case 'failed':
        return 'FAILED';
      case 'delayed':
        return 'DELAYED';
      default:
        return 'WAITING';
    }
  }

  /** Cette methode convertit un job BullMQ reel vers le contrat partage. */
  private mapperJobReel(
    job: Job<any, unknown, string>,
    statut: StatutJobBullMqShared,
  ): JobBullMqShared<TCharge> {
    return {
      id: String(job.id),
      nom: job.name,
      queueName: this.configuration.nom,
      charge: job.data as TCharge,
      statut,
      tentative: job.attemptsStarted,
      disponibleLe: new Date(job.timestamp + job.delay),
      creeLe: new Date(job.timestamp),
      termineLe: job.finishedOn ? new Date(job.finishedOn) : undefined,
      erreur: job.failedReason || undefined,
    };
  }

  /** Cette methode construit les options de connexion BullMQ depuis la config Redis partagee. */
  private construireConnexionBullMq(): {
    host: string;
    port: number;
    username?: string;
    password?: string;
    db: number;
    tls?: Record<string, unknown>;
  } {
    const configurationRedis = this.clientRedisShared.lireConfiguration();
    return {
      host: configurationRedis.host,
      port: configurationRedis.port,
      username: configurationRedis.username,
      password: configurationRedis.password,
      db: configurationRedis.database,
      tls: configurationRedis.tlsActive ? {} : undefined,
    };
  }

  /** Cette methode construit les options de job BullMQ utilisees par defaut. */
  private construireOptionsParDefaut(): JobsOptions {
    return {
      attempts: this.configuration.attempts,
      removeOnComplete: this.configuration.removeOnComplete,
      removeOnFail: this.configuration.removeOnFail,
      backoff:
        this.configuration.backoffMs !== undefined
          ? {
              type: 'fixed',
              delay: this.configuration.backoffMs,
            }
          : undefined,
    };
  }

  /** Cette methode construit les options d ajout BullMQ a partir du contrat partage. */
  private construireOptionsAjout(
    options: Readonly<Record<string, unknown>>,
  ): JobsOptions {
    const delaiMs = this.lireNombre(options.delaiMs, 0);
    return {
      ...this.construireOptionsParDefaut(),
      delay: delaiMs,
    };
  }

  /** Cette methode lit un nombre optionnel avec fallback. */
  private lireNombre(valeur: unknown, fallback: number): number {
    return typeof valeur === 'number' && Number.isFinite(valeur) ? valeur : fallback;
  }
}

/** Cette classe simule un worker BullMQ partage tout en gardant un contrat stable. */
class BullMqWorkerMemoireShared<TCharge> implements ContratWorkerBullMqShared<TCharge> {
  /** Ce constructeur relie le worker a sa config et a la queue partagee. */
  constructor(
    private readonly configuration: ConfigurationWorkerBullMqShared,
    private readonly queue: ContratQueueBullMqShared<TCharge>,
  ) {}

  /** Cette methode execute un lot local de jobs disponibles. */
  public async executerCycle(
    gestionnaire: (job: JobBullMqShared<TCharge>) => Promise<void>,
    limite = this.configuration.concurrence,
  ): Promise<readonly JobBullMqShared<TCharge>[]> {
    if (!this.configuration.autoriserTraitementLocal) {
      return [];
    }

    const resultats: JobBullMqShared<TCharge>[] = [];
    while (resultats.length < limite) {
      const job = await this.queue.extraireProchainDisponible();
      if (!job) {
        break;
      }

      try {
        await gestionnaire(job);
        await this.queue.marquerComplete(job.id);
        resultats.push({
          ...job,
          statut: 'COMPLETED',
          termineLe: new Date(),
        });
      } catch (erreur) {
        const message = erreur instanceof Error ? erreur.message : 'Echec BullMQ partage.';
        await this.queue.marquerEchec(job.id, message);
        resultats.push({
          ...job,
          statut: 'FAILED',
          termineLe: new Date(),
          erreur: message,
        });
      }
    }

    return resultats;
  }
}
