import { BaseEvenementScolarite } from './BaseEvenementScolarite';
import { Instant, UUID } from '../value-objects/TypesPrimitifs';

/**
 * Cet evenement signale le fait metier EleveStatutGlobalChange.
 */
export class EleveStatutGlobalChange extends BaseEvenementScolarite {
  constructor(idOrganisation: UUID, idEcole: UUID, declenchePar: UUID, public readonly referenceMetier: string, declencheLe: Instant = new Date()) {
    super('EleveStatutGlobalChange', idOrganisation, idEcole, declenchePar, declencheLe);
  }
}
