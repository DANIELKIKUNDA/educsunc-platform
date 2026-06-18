import type { MonitoringContextInputDto } from '../../../../monitoring/application';
import type { ReponseControleurHttpMonitoring, RequeteHttpMonitoring } from './HttpMonitoringControllerTypes';

// Ce fichier declare les helpers communs des controllers Monitoring.

export const extraireContexteHttpMonitoring = (
  requete: RequeteHttpMonitoring<unknown, unknown, unknown>,
): MonitoringContextInputDto => ({
  organisationId:
    ((requete.context as { organisationActiveId?: string } | undefined)?.organisationActiveId)
    ?? ((requete.query as { organisationId?: string } | undefined)?.organisationId)
    ?? ((requete.body as { contexte?: MonitoringContextInputDto } | undefined)?.contexte?.organisationId),
  ecoleId:
    ((requete.context as { ecoleActiveId?: string } | undefined)?.ecoleActiveId)
    ?? ((requete.query as { ecoleId?: string } | undefined)?.ecoleId)
    ?? ((requete.body as { contexte?: MonitoringContextInputDto } | undefined)?.contexte?.ecoleId),
  utilisateurId:
    ((requete.context as { utilisateurId?: string } | undefined)?.utilisateurId)
    ?? ((requete.query as { utilisateurId?: string } | undefined)?.utilisateurId)
    ?? ((requete.body as { contexte?: MonitoringContextInputDto } | undefined)?.contexte?.utilisateurId),
  module:
    ((requete.query as { module?: string } | undefined)?.module)
    ?? ((requete.body as { contexte?: MonitoringContextInputDto } | undefined)?.contexte?.module)
    ?? 'shared-monitoring',
  composant:
    ((requete.query as { composant?: string } | undefined)?.composant)
    ?? ((requete.body as { contexte?: MonitoringContextInputDto } | undefined)?.contexte?.composant)
    ?? 'api-monitoring',
  ...((requete.query as Record<string, unknown> | undefined) ?? {}),
  ...((requete.body as { contexte?: MonitoringContextInputDto } | undefined)?.contexte ?? {}),
  correlationId:
    ((requete.body as { correlationId?: string } | undefined)?.correlationId)
    ?? ((requete.headers?.['x-correlation-id'] as string | undefined) ?? undefined),
});

export const envelopperReponseHttpMonitoring = <T>(
  corps: T,
  contexte: MonitoringContextInputDto,
  commenceLe: number,
  statutHttp = 200,
): ReponseControleurHttpMonitoring<T> => ({
  statutHttp,
  corps,
  meta: {
    correlationId: contexte.correlationId,
    dureeMillisecondes: Date.now() - commenceLe,
  },
});
