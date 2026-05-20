import { EvenementDomaine } from '../../../domain/DomainEvent';

export class RoleActive extends EvenementDomaine {
  constructor(public readonly idRole: string) {
    super('RoleActive');
  }
}
