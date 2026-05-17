import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique que des non classes ont ete detectes pour une proclamation.
export class NonClassesProclamationDetectes extends EvenementDomaine {
  public readonly idProclamationClasse: string;

  constructor(idProclamationClasse: string) {
    super('NonClassesProclamationDetectes');
    this.idProclamationClasse = idProclamationClasse;
  }
}
