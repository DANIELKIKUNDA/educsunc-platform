import type { DtoRequeteNotification } from '../../../../application';

// Ce fichier expose le DTO HTTP d'entree pour les requetes de lecture Notifications.

/** Cette interface represente la query HTTP stable du module Notifications. */
export interface DtoHttpRequeteNotifications extends DtoRequeteNotification {
  readonly granularite?: 'BASIC' | 'DETAILED' | 'FORENSIC';
  readonly criticite?: 'BEST_EFFORT' | 'IMPORTANT' | 'STRICT';
  readonly inclureDeadLetter?: boolean | string;
  readonly inclureQueues?: boolean | string;
  readonly inclureFournisseurs?: boolean | string;
}
