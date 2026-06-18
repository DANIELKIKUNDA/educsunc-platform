import { CANAUX_REALTIME } from '../../../../realtime/domain';
import { PresentateurCanauxRealtimeHttp } from '../presenters';
import { envelopperReponseHttpRealtime, extraireCorrelationRealtime } from './RealtimeControllerSupport';
import type { ReponseControleurHttpRealtime, RequeteHttpRealtime } from './HttpRealtimeControllerTypes';

export class ControleurCanauxRealtimeHttp {
  public async lister(
    requete: RequeteHttpRealtime,
  ): Promise<ReponseControleurHttpRealtime<ReturnType<typeof PresentateurCanauxRealtimeHttp.presenterCanaux>>> {
    const commenceLe = Date.now();
    const correlationId = extraireCorrelationRealtime(requete);
    return envelopperReponseHttpRealtime(
      PresentateurCanauxRealtimeHttp.presenterCanaux(CANAUX_REALTIME),
      correlationId,
      commenceLe,
    );
  }
}
