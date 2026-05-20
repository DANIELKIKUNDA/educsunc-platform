import { EvenementDomaine } from '../../../domain/DomainEvent';

export class PermissionRetireeRole extends EvenementDomaine {
  constructor(public readonly idRole: string, public readonly permission: string) {
    super('PermissionRetireeRole');
  }
}
