import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { EcoleId } from '../value-objects/EcoleId';

// Cet evenement de domaine trace l'activation d'une ecole.
export class EcoleActivee extends EvenementDomaine {
  private readonly idEcole: EcoleId;

  // Ce constructeur initialise l'identifiant de l'ecole concernee.
  constructor(idEcole: EcoleId) {
    super('EcoleActivee');
    this.idEcole = idEcole;
  }

  // Cette methode retourne l'identifiant de l'ecole concernee.
  public obtenirIdEcole(): EcoleId {
    return this.idEcole;
  }
}
