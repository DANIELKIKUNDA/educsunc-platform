import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { ClassePedagogiqueId } from '../value-objects/ClassePedagogiqueId';

// Cet evenement de domaine trace la desactivation d'une classe pedagogique.
export class ClassePedagogiqueDesactivee extends EvenementDomaine {
  private readonly idClassePedagogique: ClassePedagogiqueId;

  // Ce constructeur initialise l'identifiant de la classe pedagogique concernee.
  constructor(idClassePedagogique: ClassePedagogiqueId) {
    super('ClassePedagogiqueDesactivee');
    this.idClassePedagogique = idClassePedagogique;
  }

  // Cette methode retourne l'identifiant de la classe pedagogique concernee.
  public obtenirIdClassePedagogique(): ClassePedagogiqueId {
    return this.idClassePedagogique;
  }
}
