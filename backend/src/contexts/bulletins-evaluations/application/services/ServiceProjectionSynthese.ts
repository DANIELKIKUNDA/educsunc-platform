import { SyntheseMapper } from '../mappers/SyntheseMapper';
import type { SyntheseResultatsEcole } from '../../domain/aggregates/SyntheseResultatsEcole';

// Ce service specialise la projection de synthese pour garder des use cases concis.
export class ServiceProjectionSynthese {
  constructor(private readonly mapper = new SyntheseMapper()) {}

  // Cette methode convertit une synthese de domaine en sortie applicative.
  public projeter(synthese: SyntheseResultatsEcole) {
    return this.mapper.versSortie(synthese);
  }
}
