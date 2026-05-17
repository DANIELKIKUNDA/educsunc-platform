import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique qu'un conflit de synchronisation de cote a ete detecte.
export class ConflitSynchronisationCoteDetecte extends EvenementDomaine {
  public readonly idFicheCotationEleveCours: string;

  constructor(idFicheCotationEleveCours: string) {
    super('ConflitSynchronisationCoteDetecte');
    this.idFicheCotationEleveCours = idFicheCotationEleveCours;
  }
}
