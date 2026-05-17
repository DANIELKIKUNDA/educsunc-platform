import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique qu'une proclamation de classe a ete generee.
export class ProclamationClasseGeneree extends EvenementDomaine {
  public readonly idProclamationClasse: string;
  public readonly idClassePedagogique: string;

  constructor(idProclamationClasse: string, idClassePedagogique: string) {
    super('ProclamationClasseGeneree');
    this.idProclamationClasse = idProclamationClasse;
    this.idClassePedagogique = idClassePedagogique;
  }
}
