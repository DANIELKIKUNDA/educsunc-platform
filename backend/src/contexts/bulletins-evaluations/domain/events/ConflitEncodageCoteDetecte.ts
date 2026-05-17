import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique qu'un conflit d'encodage de cote a ete detecte.
export class ConflitEncodageCoteDetecte extends EvenementDomaine {
  public readonly idFicheCotationEleveCours: string;

  constructor(idFicheCotationEleveCours: string) {
    super('ConflitEncodageCoteDetecte');
    this.idFicheCotationEleveCours = idFicheCotationEleveCours;
  }
}
