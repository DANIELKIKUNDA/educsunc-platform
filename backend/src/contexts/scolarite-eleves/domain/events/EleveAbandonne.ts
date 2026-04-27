import { BaseEvenementScolarite } from './BaseEvenementScolarite';
import { Instant, UUID } from '../value-objects/TypesPrimitifs';

/**
 * Cet evenement signale le fait metier EleveAbandonne.
 */
export class EleveAbandonne extends BaseEvenementScolarite {
  constructor(idOrganisation: UUID, idEcole: UUID, declenchePar: UUID, public readonly referenceMetier: string, declencheLe: Instant = new Date()) {
    super('EleveAbandonne', idOrganisation, idEcole, declenchePar, declencheLe);
  }
}
