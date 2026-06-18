import type {
  DiffuserMessageTempsReelUseCase,
  ObtenirEtatRealtimeUseCase,
  PublierEvenementTempsReelUseCase,
  VerifierDiffusabiliteRealtimeUseCase,
} from '../../../../realtime/application';
import { PresentateurRealtimeHttp } from '../presenters';
import {
  envelopperReponseHttpRealtime,
  extraireCommandePublicationRealtime,
  extraireCorrelationRealtime,
} from './RealtimeControllerSupport';
import type { ReponseControleurHttpRealtime, RequeteHttpRealtime } from './HttpRealtimeControllerTypes';

export class ControleurRealtimeHttp {
  constructor(
    private readonly publierUseCase: PublierEvenementTempsReelUseCase,
    private readonly diffuserUseCase: DiffuserMessageTempsReelUseCase,
    private readonly etatUseCase: ObtenirEtatRealtimeUseCase,
    private readonly verifierUseCase: VerifierDiffusabiliteRealtimeUseCase,
  ) {}

  public async publier(
    requete: RequeteHttpRealtime<import('../../../../realtime/application').PublierEvenementTempsReelCommand>,
  ): Promise<ReponseControleurHttpRealtime<ReturnType<typeof PresentateurRealtimeHttp.presenterEvenement>>> {
    const commenceLe = Date.now();
    const correlationId = extraireCorrelationRealtime(requete);
    const resultat = await this.publierUseCase.executer(extraireCommandePublicationRealtime(requete));
    return envelopperReponseHttpRealtime(
      PresentateurRealtimeHttp.presenterEvenement(resultat),
      correlationId,
      commenceLe,
      202,
    );
  }

  public async diffuser(
    requete: RequeteHttpRealtime<import('../../../../realtime/application').PublierEvenementTempsReelCommand>,
  ): Promise<ReponseControleurHttpRealtime<ReturnType<typeof PresentateurRealtimeHttp.presenterMessage>>> {
    const commenceLe = Date.now();
    const correlationId = extraireCorrelationRealtime(requete);
    const resultat = await this.diffuserUseCase.executer(extraireCommandePublicationRealtime(requete));
    return envelopperReponseHttpRealtime(
      PresentateurRealtimeHttp.presenterMessage(resultat),
      correlationId,
      commenceLe,
      202,
    );
  }

  public async consulterEtat(
    requete: RequeteHttpRealtime,
  ): Promise<ReponseControleurHttpRealtime<ReturnType<typeof PresentateurRealtimeHttp.presenterEtat>>> {
    const commenceLe = Date.now();
    const correlationId = extraireCorrelationRealtime(requete);
    const resultat = await this.etatUseCase.executer({}, []);
    return envelopperReponseHttpRealtime(
      PresentateurRealtimeHttp.presenterEtat(resultat),
      correlationId,
      commenceLe,
    );
  }

  public async verifierDiffusabilite(
    requete: RequeteHttpRealtime<import('../../../../realtime/application').PublierEvenementTempsReelCommand>,
  ): Promise<ReponseControleurHttpRealtime<{ readonly diffusable: boolean }>> {
    const commenceLe = Date.now();
    const correlationId = extraireCorrelationRealtime(requete);
    const resultat = await this.verifierUseCase.executer({
      evenement: extraireCommandePublicationRealtime(requete),
    });
    return envelopperReponseHttpRealtime({ diffusable: resultat }, correlationId, commenceLe);
  }
}
