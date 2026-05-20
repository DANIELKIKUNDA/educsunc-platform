import { EvenementDomaine } from '../../../domain/DomainEvent';

// Cet evenement signale qu'un mot de passe utilisateur vient d'etre change.
export class MotDePasseChange extends EvenementDomaine {
  constructor(public readonly idUtilisateur: string) {
    super('MotDePasseChange');
  }
}
