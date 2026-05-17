import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique qu'un echec de cote a ete detecte.
export class EchecCoteDetecte extends EvenementDomaine {
  public readonly idFicheCotationEleveCours: string;
  public readonly codeColonne: string;

  constructor(idFicheCotationEleveCours: string, codeColonne: string) {
    super('EchecCoteDetecte');
    this.idFicheCotationEleveCours = idFicheCotationEleveCours;
    this.codeColonne = codeColonne;
  }
}
