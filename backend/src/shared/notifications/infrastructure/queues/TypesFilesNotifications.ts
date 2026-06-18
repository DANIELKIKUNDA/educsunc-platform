// Ce fichier declare les types techniques du bloc queues Notifications.

/** Cette union identifie les familles de files techniques du moteur Notifications. */
export type TypeFileNotification =
  | 'DISPATCH'
  | 'RETRY'
  | 'REPLAY'
  | 'ESCALADE'
  | 'DEAD_LETTER';

/** Cette interface represente un job technique de file Notifications. */
export interface JobFileNotification {
  readonly identifiantJob: string;
  readonly identifiantNotification: string;
  readonly typeFile: TypeFileNotification;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly priorite?: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly tentative: number;
  readonly creeLe: Date;
  readonly disponibleLe: Date;
}

/** Cette interface represente un job dead letterise avec sa cause. */
export interface JobDeadLetterNotification extends JobFileNotification {
  readonly raisonDeadLetter: string;
  readonly deadLetterLe: Date;
}
