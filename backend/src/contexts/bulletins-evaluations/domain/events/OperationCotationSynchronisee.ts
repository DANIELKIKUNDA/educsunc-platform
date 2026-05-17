import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique qu'une operation offline de cotation a ete synchronisee.
export class OperationCotationSynchronisee extends EvenementDomaine {
  public readonly idFicheCotationEleveCours: string;

  constructor(idFicheCotationEleveCours: string) {
    super('OperationCotationSynchronisee');
    this.idFicheCotationEleveCours = idFicheCotationEleveCours;
  }
}
