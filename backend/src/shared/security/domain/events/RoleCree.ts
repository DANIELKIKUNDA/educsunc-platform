import { EvenementDomaine } from '../../../domain/DomainEvent';

export class RoleCree extends EvenementDomaine {
  constructor(public readonly idRole: string, public readonly codeRole: string) {
    super('RoleCree');
  }
}
