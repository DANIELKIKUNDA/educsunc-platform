import type { AudienceTempsReel } from '../entities';
import type { ContexteTempsReel } from '../value-objects';
import { PolitiqueIsolationRealtime } from '../policies';

export class SpecificationIsolationTenantRealtime {
  private readonly politique = new PolitiqueIsolationRealtime();

  public estSatisfaitePar(
    audience: AudienceTempsReel,
    contexte: ContexteTempsReel,
  ): boolean {
    return this.politique.respecter(audience, contexte);
  }
}
