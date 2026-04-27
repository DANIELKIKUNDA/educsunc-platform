import { BaseEvenementScolarite } from './BaseEvenementScolarite';
import { Instant, UUID } from '../value-objects/TypesPrimitifs';

/**
 * Cet evenement signale le fait metier ResponsablePrincipalChange.
 */
export class ResponsablePrincipalChange extends BaseEvenementScolarite {
  constructor(idOrganisation: UUID, idEcole: UUID, declenchePar: UUID, public readonly referenceMetier: string, declencheLe: Instant = new Date()) {
    super('ResponsablePrincipalChange', idOrganisation, idEcole, declenchePar, declencheLe);
  }
}
