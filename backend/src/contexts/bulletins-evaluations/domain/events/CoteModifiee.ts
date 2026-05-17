import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique qu'une cote existante a ete modifiee.
export class CoteModifiee extends EvenementDomaine {
  public readonly idFicheCotationEleveCours: string;
  public readonly codeColonne: string;

  constructor(idFicheCotationEleveCours: string, codeColonne: string) {
    super('CoteModifiee');
    this.idFicheCotationEleveCours = idFicheCotationEleveCours;
    this.codeColonne = codeColonne;
  }
}
