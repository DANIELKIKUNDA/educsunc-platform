import type { FermerConnexionTempsReelCommand } from '../commands';
import type { ConnexionTempsReelDto } from '../dto/output';
import { ServiceApplicationConnexionRealtime } from '../services';

export class FermerConnexionTempsReelUseCase {
  constructor(private readonly service: ServiceApplicationConnexionRealtime) {}

  public async executer(commande: FermerConnexionTempsReelCommand): Promise<ConnexionTempsReelDto> {
    return this.service.fermer(commande);
  }
}
