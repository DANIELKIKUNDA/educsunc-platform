import { TypeFileNotification } from './TypesFilesNotifications';

// Ce fichier declare les types de payload BullMQ specifiques au module Notifications.

/** Cette interface represente le payload BullMQ normalise d un job Notifications. */
export interface ChargeJobNotificationBullMq {
  readonly identifiantNotification: string;
  readonly typeFile: TypeFileNotification;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly priorite?: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly tentative: number;
  readonly creeLe: string;
  readonly disponibleLe: string;
}

/** Cette interface represente le payload BullMQ d une dead letter Notifications. */
export interface ChargeDeadLetterNotificationBullMq extends ChargeJobNotificationBullMq {
  readonly raisonDeadLetter: string;
  readonly deadLetterLe: string;
}
