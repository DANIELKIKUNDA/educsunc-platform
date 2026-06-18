// Ce fichier declare les types publics du socle BullMQ partage.

/** Cette union represente les statuts techniques minimaux d un job BullMQ partage. */
export type StatutJobBullMqShared =
  | 'WAITING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'FAILED'
  | 'DELAYED';

/** Cette interface represente la configuration commune d une queue BullMQ partagee. */
export interface ConfigurationQueueBullMqShared {
  readonly nom: string;
  readonly prefix?: string;
  readonly attempts?: number;
  readonly backoffMs?: number;
  readonly removeOnComplete?: boolean;
  readonly removeOnFail?: boolean;
}

/** Cette interface represente la configuration commune d un worker BullMQ partage. */
export interface ConfigurationWorkerBullMqShared {
  readonly nomQueue: string;
  readonly concurrence: number;
  readonly autoriserTraitementLocal: boolean;
}

/** Cette interface represente un job BullMQ normalise par le socle partage. */
export interface JobBullMqShared<TCharge = Readonly<Record<string, unknown>>> {
  readonly id: string;
  readonly nom: string;
  readonly queueName: string;
  readonly charge: TCharge;
  readonly statut: StatutJobBullMqShared;
  readonly tentative: number;
  readonly disponibleLe: Date;
  readonly creeLe: Date;
  readonly termineLe?: Date;
  readonly erreur?: string;
}

/** Cette interface represente le snapshot technique d une queue BullMQ partagee. */
export interface SnapshotQueueBullMqShared {
  readonly nom: string;
  readonly totalJobs: number;
  readonly waiting: number;
  readonly active: number;
  readonly completed: number;
  readonly failed: number;
  readonly delayed: number;
}

/** Cette interface represente un evenement technique de queue partagee. */
export interface EvenementQueueBullMqShared {
  readonly type: 'JOB_ADDED' | 'JOB_STARTED' | 'JOB_COMPLETED' | 'JOB_FAILED';
  readonly queueName: string;
  readonly jobId: string;
  readonly observeLe: Date;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/** Cette interface formalise le contrat minimal d une queue partagee. */
export interface ContratQueueBullMqShared<TCharge = Readonly<Record<string, unknown>>> {
  ajouter(nom: string, charge: TCharge, options?: Readonly<Record<string, unknown>>): Promise<JobBullMqShared<TCharge>>;
  extraireProchainDisponible(): Promise<JobBullMqShared<TCharge> | null>;
  marquerComplete(jobId: string): Promise<void>;
  marquerEchec(jobId: string, erreur: string): Promise<void>;
  observer(): SnapshotQueueBullMqShared;
}

/** Cette interface formalise le contrat minimal d un worker partage. */
export interface ContratWorkerBullMqShared<TCharge = Readonly<Record<string, unknown>>> {
  executerCycle(
    gestionnaire: (job: JobBullMqShared<TCharge>) => Promise<void>,
    limite?: number,
  ): Promise<readonly JobBullMqShared<TCharge>[]>;
}
