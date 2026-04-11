import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { ClasseAcademiqueId } from '../value-objects/ClasseAcademiqueId';

// Cet evenement de domaine trace la desactivation d'une classe academique.
export class ClasseAcademiqueDesactivee extends EvenementDomaine {
  private readonly idClasseAcademique: ClasseAcademiqueId;

  // Ce constructeur initialise l'identifiant de la classe academique concernee.
  constructor(idClasseAcademique: ClasseAcademiqueId) {
    super('ClasseAcademiqueDesactivee');
    this.idClasseAcademique = idClasseAcademique;
  }

  // Cette methode retourne l'identifiant de la classe academique concernee.
  public obtenirIdClasseAcademique(): ClasseAcademiqueId {
    return this.idClasseAcademique;
  }
}
