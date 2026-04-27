import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { Instant, UUID } from '../value-objects/TypesPrimitifs';

/**
 * Cette classe fournit la base commune des evenements du BC scolarite-eleves.
 */
export abstract class BaseEvenementScolarite extends EvenementDomaine {
  public readonly idOrganisation: UUID;
  public readonly idEcole: UUID;
  public readonly declenchePar: UUID;
  public readonly declencheLe: Instant;

  constructor(typeEvenement: string, idOrganisation: UUID, idEcole: UUID, declenchePar: UUID, declencheLe: Instant = new Date()) {
    super(typeEvenement);
    this.idOrganisation = idOrganisation;
    this.idEcole = idEcole;
    this.declenchePar = declenchePar;
    this.declencheLe = declencheLe;
  }
}
