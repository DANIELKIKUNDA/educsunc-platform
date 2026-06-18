import type { AbonnementTempsReel } from '../../domain';

const abonnements = new Map<string, AbonnementTempsReel>();

export class StockageAbonnementsRealtimeMemoire {
  public obtenirStore(): Map<string, AbonnementTempsReel> {
    return abonnements;
  }
}
