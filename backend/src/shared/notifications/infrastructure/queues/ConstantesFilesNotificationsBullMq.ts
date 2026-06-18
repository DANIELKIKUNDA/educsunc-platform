// Ce fichier centralise les noms BullMQ des files techniques du module Notifications.

/** Cette constante represente le nom BullMQ de la file principale de diffusion. */
export const NOM_FILE_NOTIFICATIONS_BULLMQ_DISPATCH = 'notifications.dispatch';

/** Cette constante represente le nom BullMQ de la file de retry. */
export const NOM_FILE_NOTIFICATIONS_BULLMQ_RETRY = 'notifications.retry';

/** Cette constante represente le nom BullMQ de la file de replay. */
export const NOM_FILE_NOTIFICATIONS_BULLMQ_REPLAY = 'notifications.replay';

/** Cette constante represente le nom BullMQ de la file d escalade. */
export const NOM_FILE_NOTIFICATIONS_BULLMQ_ESCALADE = 'notifications.escalade';

/** Cette constante represente le nom BullMQ de la dead-letter queue. */
export const NOM_FILE_NOTIFICATIONS_BULLMQ_DEAD_LETTER = 'notifications.dead-letter';

/** Cette constante represente le prefixe de cles BullMQ du module Notifications. */
export const PREFIXE_FILES_NOTIFICATIONS_BULLMQ = 'educsyn.notifications';
