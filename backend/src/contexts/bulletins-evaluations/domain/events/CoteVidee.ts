import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique qu'une cote a ete videe.
export class CoteVidee extends EvenementDomaine {
  public readonly idFicheCotationEleveCours: string;
  public readonly codeColonne: string;

  constructor(idFicheCotationEleveCours: string, codeColonne: string) {
    super('CoteVidee');
    this.idFicheCotationEleveCours = idFicheCotationEleveCours;
    this.codeColonne = codeColonne;
  }
}
