import { BaseEvenementScolarite } from './BaseEvenementScolarite';
import { Instant, UUID } from '../value-objects/TypesPrimitifs';

/**
 * Cet evenement signale le fait metier ResponsableFamilleModifie.
 */
export class ResponsableFamilleModifie extends BaseEvenementScolarite {
  constructor(idOrganisation: UUID, idEcole: UUID, declenchePar: UUID, public readonly referenceMetier: string, declencheLe: Instant = new Date()) {
    super('ResponsableFamilleModifie', idOrganisation, idEcole, declenchePar, declencheLe);
  }
}
