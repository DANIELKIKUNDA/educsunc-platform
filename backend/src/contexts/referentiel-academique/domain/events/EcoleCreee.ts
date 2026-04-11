import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { EcoleId } from '../value-objects/EcoleId';

// Cet evenement de domaine trace la creation d'une ecole.
export class EcoleCreee extends EvenementDomaine {
  private readonly idEcole: EcoleId;

  // Ce constructeur initialise l'identifiant de l'ecole concernee.
  constructor(idEcole: EcoleId) {
    super('EcoleCreee');
    this.idEcole = idEcole;
  }

  // Cette methode retourne l'identifiant de l'ecole concernee.
  public obtenirIdEcole(): EcoleId {
    return this.idEcole;
  }
}
