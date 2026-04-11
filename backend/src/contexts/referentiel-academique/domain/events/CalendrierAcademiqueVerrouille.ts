import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { CalendrierAcademiqueId } from '../value-objects/CalendrierAcademiqueId';

// Cet evenement de domaine trace le verrouillage d'un calendrier academique.
export class CalendrierAcademiqueVerrouille extends EvenementDomaine {
  private readonly idCalendrierAcademique: CalendrierAcademiqueId;

  // Ce constructeur initialise l'identifiant du calendrier academique concerne.
  constructor(idCalendrierAcademique: CalendrierAcademiqueId) {
    super('CalendrierAcademiqueVerrouille');
    this.idCalendrierAcademique = idCalendrierAcademique;
  }

  // Cette methode retourne l'identifiant du calendrier academique concerne.
  public obtenirIdCalendrierAcademique(): CalendrierAcademiqueId {
    return this.idCalendrierAcademique;
  }
}
