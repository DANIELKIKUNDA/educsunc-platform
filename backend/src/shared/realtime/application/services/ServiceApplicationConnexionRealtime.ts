import type { PortRepositoryConnexionRealtime } from '../../domain';
import { StatutConnexionRealtime } from '../../domain';
import type {
  FermerConnexionTempsReelCommand,
  OuvrirConnexionTempsReelCommand,
  ReconnecterConnexionTempsReelCommand,
} from '../commands';
import type { ConnexionTempsReelDto } from '../dto/output';
import { ExceptionConnexionRealtimeIntrouvable } from '../exceptions';
import { ConnexionTempsReelApplicationMapper } from '../mappers';
import { ValidateurConnexionTempsReel } from '../validators';

export class ServiceApplicationConnexionRealtime {
  constructor(
    private readonly repository: PortRepositoryConnexionRealtime,
    private readonly validateur = new ValidateurConnexionTempsReel(),
    private readonly mapper = new ConnexionTempsReelApplicationMapper(),
  ) {}

  public async ouvrir(commande: OuvrirConnexionTempsReelCommand): Promise<ConnexionTempsReelDto> {
    this.validateur.valider(commande);
    const connexion = this.mapper.versDomaine(commande);
    connexion.activer();
    await this.repository.sauvegarder(connexion);
    return this.mapper.versDto(connexion);
  }

  public async fermer(commande: FermerConnexionTempsReelCommand): Promise<ConnexionTempsReelDto> {
    const connexion = await this.repository.trouverParId(commande.connexionId);
    if (!connexion) {
      throw new ExceptionConnexionRealtimeIntrouvable();
    }
    connexion.fermer();
    await this.repository.sauvegarder(connexion);
    return this.mapper.versDto(connexion);
  }

  public async reconnecter(
    commande: ReconnecterConnexionTempsReelCommand,
  ): Promise<ConnexionTempsReelDto> {
    const connexion = await this.repository.trouverParId(commande.connexionId);
    if (!connexion) {
      throw new ExceptionConnexionRealtimeIntrouvable();
    }
    if (connexion.obtenirStatut() === StatutConnexionRealtime.CLOSED) {
      connexion.reconnecter();
    } else {
      connexion.reconnecter();
      connexion.activer();
    }
    await this.repository.sauvegarder(connexion);
    return this.mapper.versDto(connexion);
  }
}
