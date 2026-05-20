import { EvenementDomaine } from '../../../domain/DomainEvent';

export class RoleDesactive extends EvenementDomaine {
  constructor(public readonly idRole: string) {
    super('RoleDesactive');
  }
}
