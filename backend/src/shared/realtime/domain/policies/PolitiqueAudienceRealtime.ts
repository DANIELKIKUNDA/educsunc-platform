import type { AudienceTempsReel } from '../entities';

export class PolitiqueAudienceRealtime {
  public autoriser(audience: AudienceTempsReel, utilisateurId: string): boolean {
    return audience.contientUtilisateur(utilisateurId);
  }
}
