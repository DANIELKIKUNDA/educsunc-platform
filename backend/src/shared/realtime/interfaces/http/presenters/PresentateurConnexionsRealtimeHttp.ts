import type { ConnexionTempsReelDto } from '../../../../realtime/application';

export class PresentateurConnexionsRealtimeHttp {
  public static presenterConnexion(connexion: ConnexionTempsReelDto) {
    return { connexion };
  }
}
