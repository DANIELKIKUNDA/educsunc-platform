import { BaseEvenementScolarite } from './BaseEvenementScolarite';
import { Instant, UUID } from '../value-objects/TypesPrimitifs';

/**
 * Cet evenement signale le fait metier ParcoursEleveReconstruit.
 */
export class ParcoursEleveReconstruit extends BaseEvenementScolarite {
  constructor(idOrganisation: UUID, idEcole: UUID, declenchePar: UUID, public readonly referenceMetier: string, declencheLe: Instant = new Date()) {
    super('ParcoursEleveReconstruit', idOrganisation, idEcole, declenchePar, declencheLe);
  }
}
