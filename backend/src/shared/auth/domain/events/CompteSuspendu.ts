import { EvenementDomaine } from '../../../domain/DomainEvent';

// Cet evenement signale qu'un compte utilisateur a ete suspendu.
export class CompteSuspendu extends EvenementDomaine {
  constructor(public readonly idUtilisateur: string) {
    super('CompteSuspendu');
  }
}
