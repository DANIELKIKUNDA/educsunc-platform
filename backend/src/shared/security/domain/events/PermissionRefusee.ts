import { EvenementDomaine } from '../../../domain/DomainEvent';

export class PermissionRefusee extends EvenementDomaine {
  constructor(public readonly idUtilisateur: string, public readonly permission: string, public readonly raisonRefus?: string) {
    super('PermissionRefusee');
  }
}
