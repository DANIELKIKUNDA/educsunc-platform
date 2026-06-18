// Ce fichier declare le DTO HTTP de propagation de configuration.

export interface DtoHttpPropagationConfiguration {
  readonly actorId?: string;
  readonly canauxCibles?: readonly string[];
}
