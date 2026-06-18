// Ce fichier centralise les constantes par defaut du socle BullMQ partage.

/** Cette constante represente le prefixe BullMQ partage par defaut du backend EducSyn. */
export const PREFIXE_BULLMQ_SHARED_PAR_DEFAUT = 'educsyn';

/** Cette constante represente le nombre d attempts par defaut d un job partage. */
export const ATTEMPTS_BULLMQ_SHARED_PAR_DEFAUT = 3;

/** Cette constante represente le backoff simple par defaut d un job partage. */
export const BACKOFF_BULLMQ_SHARED_PAR_DEFAUT_MS = 30_000;

/** Cette constante represente la concurrence locale par defaut d un worker partage. */
export const CONCURRENCE_BULLMQ_SHARED_PAR_DEFAUT = 5;
