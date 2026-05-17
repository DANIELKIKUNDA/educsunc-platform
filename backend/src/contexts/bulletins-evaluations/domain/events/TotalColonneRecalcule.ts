import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique qu'un total de colonne a ete recalcule.
export class TotalColonneRecalcule extends EvenementDomaine {
  public readonly idFicheCotationEleveCours: string;
  public readonly codeColonne: string;

  constructor(idFicheCotationEleveCours: string, codeColonne: string) {
    super('TotalColonneRecalcule');
    this.idFicheCotationEleveCours = idFicheCotationEleveCours;
    this.codeColonne = codeColonne;
  }
}
