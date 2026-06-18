import type { MonitoringContextInputDto } from '../dto/input';

// Ce fichier declare la query de lecture de l etat systeme.

/** Cette interface represente la query de lecture d etat systeme. */
export interface GetSystemStateQuery {
  readonly contexte: MonitoringContextInputDto;
}
