import type { AbonnementTempsReelDto } from '../../../../realtime/application';

export class PresentateurAbonnementsRealtimeHttp {
  public static presenterAbonnement(abonnement: AbonnementTempsReelDto) {
    return { abonnement };
  }
}
