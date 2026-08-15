import type { MonitoringContextInputDto } from '../../../../monitoring/application';
import type { ReponseControleurHttpMonitoring, RequeteHttpMonitoring } from './HttpMonitoringControllerTypes';

type ContexteAuthentifieMonitoring = {
  readonly organisationActiveId?: string;
  readonly ecoleActiveId?: string;
  readonly utilisateurId?: string;
};

const lireTexteOptionnel = (valeur: unknown, max = 160): string | undefined => {
  if (typeof valeur !== 'string') return undefined;
  const texte = valeur.trim();
  if (!texte || texte.length > max) return undefined;
  return texte;
};

// Les identifiants de securite proviennent exclusivement du contexte authentifie.
// Le client peut seulement fournir des filtres fonctionnels non privilegies
// (module, composant, correlationId). Il ne peut jamais changer son tenant.
export const extraireContexteHttpMonitoring = (
  requete: RequeteHttpMonitoring<unknown, unknown, unknown>,
): MonitoringContextInputDto => {
  const contexteAuthentifie = (requete.context ?? {}) as ContexteAuthentifieMonitoring;
  const query = (requete.query ?? {}) as Record<string, unknown>;
  const body = (requete.body ?? {}) as Record<string, unknown>;
  const contexteClient = (
    typeof body.contexte === 'object' && body.contexte !== null
      ? body.contexte
      : {}
  ) as Record<string, unknown>;

  const correlationId =
    lireTexteOptionnel(body.correlationId, 128)
    ?? lireTexteOptionnel(requete.headers?.['x-correlation-id'], 128)
    ?? lireTexteOptionnel(query.correlationId, 128);

  return {
    organisationId: lireTexteOptionnel(contexteAuthentifie.organisationActiveId),
    ecoleId: lireTexteOptionnel(contexteAuthentifie.ecoleActiveId),
    utilisateurId: lireTexteOptionnel(contexteAuthentifie.utilisateurId),
    module:
      lireTexteOptionnel(query.module)
      ?? lireTexteOptionnel(contexteClient.module)
      ?? 'shared-monitoring',
    composant:
      lireTexteOptionnel(query.composant)
      ?? lireTexteOptionnel(contexteClient.composant)
      ?? 'api-monitoring',
    correlationId,
  };
};

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
