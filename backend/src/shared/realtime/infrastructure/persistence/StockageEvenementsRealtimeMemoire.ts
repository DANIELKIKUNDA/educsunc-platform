import type { EvenementTempsReel } from '../../domain';

const evenements = new Map<string, EvenementTempsReel>();

export class StockageEvenementsRealtimeMemoire {
  public obtenirStore(): Map<string, EvenementTempsReel> {
    return evenements;
  }
}
