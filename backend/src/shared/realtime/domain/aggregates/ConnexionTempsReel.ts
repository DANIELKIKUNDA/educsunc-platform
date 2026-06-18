import { StatutConnexionRealtime } from '../enums';
import type { ContexteTempsReel, RealtimeId } from '../value-objects';

export class ConnexionTempsReel {
  private statut: StatutConnexionRealtime;

  public constructor(
    public readonly id: RealtimeId,
    public readonly utilisateurId: string,
    public readonly contexte: ContexteTempsReel,
    statut: StatutConnexionRealtime = StatutConnexionRealtime.ACTIVE,
  ) {
    this.statut = statut;
  }

  public obtenirStatut(): StatutConnexionRealtime {
    return this.statut;
  }

  public reconnecter(): void {
    this.statut = StatutConnexionRealtime.RECONNECTING;
  }

  public activer(): void {
    this.statut = StatutConnexionRealtime.ACTIVE;
  }

  public fermer(): void {
    this.statut = StatutConnexionRealtime.CLOSED;
  }
}
