import type { IdempotencyStore } from 'shared/infrastructure/idempotency/IdempotencyStore';

// Ce contrat specialise l'idempotence partagee pour les operations SECURITY.
export interface SecurityIdempotencyStore extends IdempotencyStore {}
