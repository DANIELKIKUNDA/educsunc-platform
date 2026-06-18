import {
  AbonnementTempsReel,
  CanalTempsReel,
  RealtimeId,
} from '../../domain';
import type { AbonnerConnexionTempsReelCommand } from '../commands';
import type { AbonnementTempsReelDto } from '../dto/output';

export class AbonnementTempsReelApplicationMapper {
  public versDomaine(commande: AbonnerConnexionTempsReelCommand): AbonnementTempsReel {
    return new AbonnementTempsReel(
      new RealtimeId(commande.abonnementId),
      new RealtimeId(commande.connexionId),
      new CanalTempsReel(commande.canal),
    );
  }

  public versDto(abonnement: AbonnementTempsReel): AbonnementTempsReelDto {
    return {
      id: abonnement.id.value,
      connexionId: abonnement.connexionId.value,
      canal: abonnement.canal.nom,
      statut: abonnement.obtenirStatut(),
    };
  }
}
