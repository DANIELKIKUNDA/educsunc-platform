import type {
  FermerConnexionTempsReelUseCase,
  OuvrirConnexionTempsReelUseCase,
  ReconnecterConnexionTempsReelUseCase,
} from '../../../../realtime/application';
import { PresentateurConnexionsRealtimeHttp } from '../presenters';
import {
  envelopperReponseHttpRealtime,
  extraireCommandeConnexionRealtime,
  extraireCorrelationRealtime,
} from './RealtimeControllerSupport';
import type { ReponseControleurHttpRealtime, RequeteHttpRealtime } from './HttpRealtimeControllerTypes';

export class ControleurConnexionsRealtimeHttp {
  constructor(
    private readonly ouvrirUseCase: OuvrirConnexionTempsReelUseCase,
    private readonly fermerUseCase: FermerConnexionTempsReelUseCase,
    private readonly reconnecterUseCase: ReconnecterConnexionTempsReelUseCase,
  ) {}

  public async ouvrir(
    requete: RequeteHttpRealtime<import('../../../../realtime/application').OuvrirConnexionTempsReelCommand>,
  ) {
    const commenceLe = Date.now();
    const correlationId = extraireCorrelationRealtime(requete);
    const resultat = await this.ouvrirUseCase.executer(extraireCommandeConnexionRealtime(requete));
    return envelopperReponseHttpRealtime(
      PresentateurConnexionsRealtimeHttp.presenterConnexion(resultat),
      correlationId,
      commenceLe,
      201,
    );
  }

  public async fermer(
    requete: RequeteHttpRealtime<{ readonly connexionId: string }>,
  ): Promise<ReponseControleurHttpRealtime<ReturnType<typeof PresentateurConnexionsRealtimeHttp.presenterConnexion>>> {
    const commenceLe = Date.now();
    const correlationId = extraireCorrelationRealtime(requete);
    const resultat = await this.fermerUseCase.executer({
      connexionId: (requete.body as { readonly connexionId: string }).connexionId,
    });
    return envelopperReponseHttpRealtime(
      PresentateurConnexionsRealtimeHttp.presenterConnexion(resultat),
      correlationId,
      commenceLe,
    );
  }

  public async reconnecter(
    requete: RequeteHttpRealtime<{ readonly connexionId: string }>,
  ): Promise<ReponseControleurHttpRealtime<ReturnType<typeof PresentateurConnexionsRealtimeHttp.presenterConnexion>>> {
    const commenceLe = Date.now();
    const correlationId = extraireCorrelationRealtime(requete);
    const resultat = await this.reconnecterUseCase.executer({
      connexionId: (requete.body as { readonly connexionId: string }).connexionId,
    });
    return envelopperReponseHttpRealtime(
      PresentateurConnexionsRealtimeHttp.presenterConnexion(resultat),
      correlationId,
      commenceLe,
    );
  }
}
