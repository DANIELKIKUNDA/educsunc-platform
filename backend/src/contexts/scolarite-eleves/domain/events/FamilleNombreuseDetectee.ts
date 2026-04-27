import { BaseEvenementScolarite } from './BaseEvenementScolarite';
import { Instant, UUID } from '../value-objects/TypesPrimitifs';

/**
 * Cet evenement signale le fait metier FamilleNombreuseDetectee.
 */
export class FamilleNombreuseDetectee extends BaseEvenementScolarite {
  constructor(idOrganisation: UUID, idEcole: UUID, declenchePar: UUID, public readonly referenceMetier: string, declencheLe: Instant = new Date()) {
    super('FamilleNombreuseDetectee', idOrganisation, idEcole, declenchePar, declencheLe);
  }
}
