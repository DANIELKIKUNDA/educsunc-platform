import type { EtatRealtimeDto, EvenementTempsReelDto, MessageTempsReelDto } from '../../../../realtime/application';

export class PresentateurRealtimeHttp {
  public static presenterEvenement(evenement: EvenementTempsReelDto) {
    return { evenement };
  }

  public static presenterMessage(message: MessageTempsReelDto) {
    return { message };
  }

  public static presenterEtat(etat: EtatRealtimeDto) {
    return { etat };
  }
}
