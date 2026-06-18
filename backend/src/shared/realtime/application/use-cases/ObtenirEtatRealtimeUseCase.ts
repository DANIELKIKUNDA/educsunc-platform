import type { EtatRealtimeDto } from '../dto/output';
import type { ObtenirEtatRealtimeQuery } from '../queries';
import { ServiceApplicationEtatRealtime } from '../services';

export class ObtenirEtatRealtimeUseCase {
  constructor(private readonly service: ServiceApplicationEtatRealtime) {}

  public async executer(
    _query: ObtenirEtatRealtimeQuery,
    connexionIds: readonly string[] = [],
  ): Promise<EtatRealtimeDto> {
    return this.service.obtenirEtat(connexionIds);
  }
}
