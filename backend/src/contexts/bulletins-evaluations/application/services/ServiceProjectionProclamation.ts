import { ProclamationMapper } from '../mappers/ProclamationMapper';
import type { ProclamationClasse } from '../../domain/aggregates/ProclamationClasse';

// Ce service specialise la projection de proclamation pour garder des use cases concis.
export class ServiceProjectionProclamation {
  constructor(private readonly mapper = new ProclamationMapper()) {}

  // Cette methode convertit une proclamation de domaine en sortie applicative.
  public projeter(proclamation: ProclamationClasse) {
    return this.mapper.versSortie(proclamation);
  }
}
