import type {
  FermerConnexionTempsReelCommand,
  OuvrirConnexionTempsReelCommand,
  ReconnecterConnexionTempsReelCommand,
} from '../commands';
import type { ConnexionTempsReelDto } from '../dto/output';
import { ServiceApplicationConnexionRealtime } from '../services';

export class OrchestrateurConnexionRealtime {
  constructor(private readonly service: ServiceApplicationConnexionRealtime) {}

  public ouvrir(commande: OuvrirConnexionTempsReelCommand): Promise<ConnexionTempsReelDto> {
    return this.service.ouvrir(commande);
  }

  public fermer(commande: FermerConnexionTempsReelCommand): Promise<ConnexionTempsReelDto> {
    return this.service.fermer(commande);
  }

  public reconnecter(
    commande: ReconnecterConnexionTempsReelCommand,
  ): Promise<ConnexionTempsReelDto> {
    return this.service.reconnecter(commande);
  }
}
