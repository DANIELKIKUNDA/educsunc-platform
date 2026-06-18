import { StatutAbonnementRealtime } from '../enums';
import type { CanalTempsReel } from '../entities';
import type { RealtimeId } from '../value-objects';

export class AbonnementTempsReel {
  private statut: StatutAbonnementRealtime;

  public constructor(
    public readonly id: RealtimeId,
    public readonly connexionId: RealtimeId,
    public readonly canal: CanalTempsReel,
    statut: StatutAbonnementRealtime = StatutAbonnementRealtime.ACTIF,
  ) {
    this.statut = statut;
  }

  public obtenirStatut(): StatutAbonnementRealtime {
    return this.statut;
  }

  public suspendre(): void {
    this.statut = StatutAbonnementRealtime.SUSPENDU;
  }

  public retirer(): void {
    this.statut = StatutAbonnementRealtime.RETIRE;
  }
}
