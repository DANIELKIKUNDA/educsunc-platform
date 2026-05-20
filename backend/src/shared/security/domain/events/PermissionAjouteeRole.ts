import { EvenementDomaine } from '../../../domain/DomainEvent';

export class PermissionAjouteeRole extends EvenementDomaine {
  constructor(public readonly idRole: string, public readonly permission: string) {
    super('PermissionAjouteeRole');
  }
}
