import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique qu'une cote a ete encodee.
export class CoteEncodee extends EvenementDomaine {
  public readonly idFicheCotationEleveCours: string;
  public readonly codeColonne: string;

  constructor(idFicheCotationEleveCours: string, codeColonne: string) {
    super('CoteEncodee');
    this.idFicheCotationEleveCours = idFicheCotationEleveCours;
    this.codeColonne = codeColonne;
  }
}
