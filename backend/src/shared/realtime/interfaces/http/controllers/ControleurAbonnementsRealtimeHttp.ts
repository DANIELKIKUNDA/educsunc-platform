import type {
  AbonnerConnexionTempsReelUseCase,
  DesabonnerConnexionTempsReelUseCase,
} from '../../../../realtime/application';
import { PresentateurAbonnementsRealtimeHttp } from '../presenters';
import {
  envelopperReponseHttpRealtime,
  extraireCommandeAbonnementRealtime,
  extraireCorrelationRealtime,
} from './RealtimeControllerSupport';
import type { ReponseControleurHttpRealtime, RequeteHttpRealtime } from './HttpRealtimeControllerTypes';

export class ControleurAbonnementsRealtimeHttp {
  constructor(
    private readonly abonnerUseCase: AbonnerConnexionTempsReelUseCase,
    private readonly desabonnerUseCase: DesabonnerConnexionTempsReelUseCase,
  ) {}

  public async abonner(
    requete: RequeteHttpRealtime<import('../../../../realtime/application').AbonnerConnexionTempsReelCommand>,
  ): Promise<ReponseControleurHttpRealtime<ReturnType<typeof PresentateurAbonnementsRealtimeHttp.presenterAbonnement>>> {
    const commenceLe = Date.now();
    const correlationId = extraireCorrelationRealtime(requete);
    const resultat = await this.abonnerUseCase.executer(extraireCommandeAbonnementRealtime(requete));
    return envelopperReponseHttpRealtime(
      PresentateurAbonnementsRealtimeHttp.presenterAbonnement(resultat),
      correlationId,
      commenceLe,
      201,
    );
  }

  public async desabonner(
    requete: RequeteHttpRealtime<{ readonly connexionId: string; readonly canal: string }>,
  ): Promise<ReponseControleurHttpRealtime<ReturnType<typeof PresentateurAbonnementsRealtimeHttp.presenterAbonnement>>> {
    const commenceLe = Date.now();
    const correlationId = extraireCorrelationRealtime(requete);
    const body = requete.body as { readonly connexionId: string; readonly canal: string };
    const resultat = await this.desabonnerUseCase.executer(body);
    return envelopperReponseHttpRealtime(
      PresentateurAbonnementsRealtimeHttp.presenterAbonnement(resultat),
      correlationId,
      commenceLe,
    );
  }
}
