import type {
  AbonnerConnexionTempsReelCommand,
  DesabonnerConnexionTempsReelCommand,
} from '../commands';
import type { AbonnementTempsReelDto } from '../dto/output';
import { ServiceApplicationAbonnementRealtime } from '../services';

export class OrchestrateurAbonnementRealtime {
  constructor(private readonly service: ServiceApplicationAbonnementRealtime) {}

  public abonner(commande: AbonnerConnexionTempsReelCommand): Promise<AbonnementTempsReelDto> {
    return this.service.abonner(commande);
  }

  public desabonner(
    commande: DesabonnerConnexionTempsReelCommand,
  ): Promise<AbonnementTempsReelDto> {
    return this.service.desabonner(commande);
  }
}
