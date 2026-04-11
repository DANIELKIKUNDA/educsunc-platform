import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { CalendrierAcademiqueId } from '../value-objects/CalendrierAcademiqueId';

// Cet evenement de domaine trace la validation d'un calendrier academique.
export class CalendrierValide extends EvenementDomaine {
  private readonly idCalendrierAcademique: CalendrierAcademiqueId;

  // Ce constructeur initialise l'identifiant du calendrier academique concerne.
  constructor(idCalendrierAcademique: CalendrierAcademiqueId) {
    super('CalendrierValide');
    this.idCalendrierAcademique = idCalendrierAcademique;
  }

  // Cette methode retourne l'identifiant du calendrier academique concerne.
  public obtenirIdCalendrierAcademique(): CalendrierAcademiqueId {
    return this.idCalendrierAcademique;
  }
}
