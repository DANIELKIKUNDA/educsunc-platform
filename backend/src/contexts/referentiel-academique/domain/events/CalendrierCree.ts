import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { CalendrierAcademiqueId } from '../value-objects/CalendrierAcademiqueId';

// Cet evenement de domaine trace la creation d'un calendrier academique.
export class CalendrierCree extends EvenementDomaine {
  private readonly idCalendrierAcademique: CalendrierAcademiqueId;

  // Ce constructeur initialise l'identifiant du calendrier academique concerne.
  constructor(idCalendrierAcademique: CalendrierAcademiqueId) {
    super('CalendrierCree');
    this.idCalendrierAcademique = idCalendrierAcademique;
  }

  // Cette methode retourne l'identifiant du calendrier academique concerne.
  public obtenirIdCalendrierAcademique(): CalendrierAcademiqueId {
    return this.idCalendrierAcademique;
  }
}
