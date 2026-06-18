import type {
  AbonnerConnexionTempsReelCommand,
  OuvrirConnexionTempsReelCommand,
  PublierEvenementTempsReelCommand,
} from '../../../../realtime/application';
import type { ReponseControleurHttpRealtime, RequeteHttpRealtime } from './HttpRealtimeControllerTypes';

export const extraireCorrelationRealtime = (
  requete: RequeteHttpRealtime<unknown, unknown, unknown>,
): string | undefined =>
  ((requete.headers?.['x-correlation-id'] as string | undefined) ?? undefined);

export const extraireCommandePublicationRealtime = (
  requete: RequeteHttpRealtime<PublierEvenementTempsReelCommand>,
): PublierEvenementTempsReelCommand => requete.body as PublierEvenementTempsReelCommand;

export const extraireCommandeConnexionRealtime = (
  requete: RequeteHttpRealtime<OuvrirConnexionTempsReelCommand>,
): OuvrirConnexionTempsReelCommand => requete.body as OuvrirConnexionTempsReelCommand;

export const extraireCommandeAbonnementRealtime = (
  requete: RequeteHttpRealtime<AbonnerConnexionTempsReelCommand>,
): AbonnerConnexionTempsReelCommand => requete.body as AbonnerConnexionTempsReelCommand;

export const envelopperReponseHttpRealtime = <T>(
  corps: T,
  correlationId: string | undefined,
  commenceLe: number,
  statutHttp = 200,
): ReponseControleurHttpRealtime<T> => ({
  statutHttp,
  corps,
  meta: {
    correlationId,
    dureeMillisecondes: Date.now() - commenceLe,
  },
});
