import {
  ContexteTempsReel,
  ConnexionTempsReel,
  RealtimeId,
} from '../../domain';
import type { OuvrirConnexionTempsReelCommand } from '../commands';
import type { ConnexionTempsReelDto } from '../dto/output';

export class ConnexionTempsReelApplicationMapper {
  public versDomaine(commande: OuvrirConnexionTempsReelCommand): ConnexionTempsReel {
    return new ConnexionTempsReel(
      new RealtimeId(commande.connexionId),
      commande.utilisateurId,
      new ContexteTempsReel(commande.contexte),
    );
  }

  public versDto(connexion: ConnexionTempsReel): ConnexionTempsReelDto {
    return {
      id: connexion.id.value,
      utilisateurId: connexion.utilisateurId,
      statut: connexion.obtenirStatut(),
    };
  }
}
