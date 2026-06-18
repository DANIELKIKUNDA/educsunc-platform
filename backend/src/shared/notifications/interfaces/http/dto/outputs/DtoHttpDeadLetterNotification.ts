import type { DtoDeadLetterNotification } from '../../../../application';

// Ce fichier expose le DTO HTTP de sortie pour une dead letter Notifications.

/** Cette interface represente une entree HTTP de dead letter. */
export interface DtoHttpDeadLetterNotification extends DtoDeadLetterNotification {}
