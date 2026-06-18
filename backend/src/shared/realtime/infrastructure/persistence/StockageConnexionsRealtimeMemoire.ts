import type { ConnexionTempsReel } from '../../domain';

const connexions = new Map<string, ConnexionTempsReel>();

export class StockageConnexionsRealtimeMemoire {
  public obtenirStore(): Map<string, ConnexionTempsReel> {
    return connexions;
  }
}
