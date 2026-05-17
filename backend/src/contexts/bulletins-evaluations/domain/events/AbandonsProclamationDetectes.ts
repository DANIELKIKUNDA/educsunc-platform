import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique que des abandons ont ete detectes pour une proclamation.
export class AbandonsProclamationDetectes extends EvenementDomaine {
  public readonly idProclamationClasse: string;

  constructor(idProclamationClasse: string) {
    super('AbandonsProclamationDetectes');
    this.idProclamationClasse = idProclamationClasse;
  }
}
