import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { EcoleId } from '../value-objects/EcoleId';

// Cet evenement de domaine trace la desactivation d'une ecole.
export class EcoleDesactivee extends EvenementDomaine {
  private readonly idEcole: EcoleId;

  // Ce constructeur initialise l'identifiant de l'ecole concernee.
  constructor(idEcole: EcoleId) {
    super('EcoleDesactivee');
    this.idEcole = idEcole;
  }

  // Cette methode retourne l'identifiant de l'ecole concernee.
  public obtenirIdEcole(): EcoleId {
    return this.idEcole;
  }
}
