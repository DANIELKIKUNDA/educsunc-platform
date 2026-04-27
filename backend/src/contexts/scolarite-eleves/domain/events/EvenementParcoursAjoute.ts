import { BaseEvenementScolarite } from './BaseEvenementScolarite';
import { Instant, UUID } from '../value-objects/TypesPrimitifs';

/**
 * Cet evenement signale le fait metier EvenementParcoursAjoute.
 */
export class EvenementParcoursAjoute extends BaseEvenementScolarite {
  constructor(idOrganisation: UUID, idEcole: UUID, declenchePar: UUID, public readonly referenceMetier: string, declencheLe: Instant = new Date()) {
    super('EvenementParcoursAjoute', idOrganisation, idEcole, declenchePar, declencheLe);
  }
}
