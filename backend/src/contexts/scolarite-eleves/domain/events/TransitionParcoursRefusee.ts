import { BaseEvenementScolarite } from './BaseEvenementScolarite';
import { Instant, UUID } from '../value-objects/TypesPrimitifs';

/**
 * Cet evenement signale le fait metier TransitionParcoursRefusee.
 */
export class TransitionParcoursRefusee extends BaseEvenementScolarite {
  constructor(idOrganisation: UUID, idEcole: UUID, declenchePar: UUID, public readonly referenceMetier: string, declencheLe: Instant = new Date()) {
    super('TransitionParcoursRefusee', idOrganisation, idEcole, declenchePar, declencheLe);
  }
}
