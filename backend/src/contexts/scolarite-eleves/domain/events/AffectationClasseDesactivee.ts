import { BaseEvenementScolarite } from './BaseEvenementScolarite';
import { Instant, UUID } from '../value-objects/TypesPrimitifs';

/**
 * Cet evenement signale le fait metier AffectationClasseDesactivee.
 */
export class AffectationClasseDesactivee extends BaseEvenementScolarite {
  constructor(idOrganisation: UUID, idEcole: UUID, declenchePar: UUID, public readonly referenceMetier: string, declencheLe: Instant = new Date()) {
    super('AffectationClasseDesactivee', idOrganisation, idEcole, declenchePar, declencheLe);
  }
}
