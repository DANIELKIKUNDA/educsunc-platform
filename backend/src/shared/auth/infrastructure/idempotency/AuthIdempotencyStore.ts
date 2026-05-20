import { IdempotencyStore } from '../../../infrastructure/idempotency/IdempotencyStore';

// Ce contrat specialise l'idempotence transverse pour les operations AUTH.
export interface AuthIdempotencyStore extends IdempotencyStore {}
