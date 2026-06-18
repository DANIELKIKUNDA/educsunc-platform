import type { ReponseControleurHttpConfiguration, RequeteHttpConfiguration } from './HttpConfigurationControllerTypes';

// Ce fichier declare le support partage des controllers HTTP Configuration.

/** Cette interface represente le contexte runtime HTTP extrait de la requete. */
export interface ContexteHttpConfiguration {
  readonly correlationId?: string;
  readonly requestId?: string;
}

/** Cette fonction extrait un contexte technique minimal a partir de la requete. */
export function extraireContexteHttpConfiguration(
  requete: RequeteHttpConfiguration<unknown, Record<string, unknown>, Record<string, unknown>>,
): ContexteHttpConfiguration {
  const context = requete.context ?? {};
  const headers = requete.headers ?? {};

  return {
    correlationId: String(
      context.correlationId
      ?? headers['x-correlation-id']
      ?? headers['X-Correlation-Id']
      ?? '',
    ) || undefined,
    requestId: String(
      context.requestId
      ?? headers['x-request-id']
      ?? headers['X-Request-Id']
      ?? '',
    ) || undefined,
  };
}

/** Cette fonction enrichit une charge avec le contexte HTTP lorsqu il existe. */
export function enrichirContexteHttpConfiguration<TCharge extends object>(
  charge: TCharge,
  contexte: ContexteHttpConfiguration,
): TCharge & ContexteHttpConfiguration {
  return {
    ...charge,
    ...contexte,
  };
}

/** Cette fonction enveloppe une reponse HTTP standard. */
export function envelopperReponseHttpConfiguration<TDonnees>(
  donnees: TDonnees,
  contexte: ContexteHttpConfiguration,
  commenceLe: number,
  code = 200,
): ReponseControleurHttpConfiguration<TDonnees> {
  return {
    succes: true,
    code,
    donnees,
    meta: {
      dureeMs: Math.max(0, Date.now() - commenceLe),
      correlationId: contexte.correlationId,
      requestId: contexte.requestId,
    },
  };
}
