import { BaseEvenementScolarite } from './BaseEvenementScolarite';
import { Instant, UUID } from '../value-objects/TypesPrimitifs';

/**
 * Cet evenement signale le fait metier ResponsableFamilleRetire.
 */
export class ResponsableFamilleRetire extends BaseEvenementScolarite {
  constructor(idOrganisation: UUID, idEcole: UUID, declenchePar: UUID, public readonly referenceMetier: string, declencheLe: Instant = new Date()) {
    super('ResponsableFamilleRetire', idOrganisation, idEcole, declenchePar, declencheLe);
  }
}
