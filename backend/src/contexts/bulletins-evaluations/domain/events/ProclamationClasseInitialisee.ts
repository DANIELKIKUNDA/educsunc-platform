import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique qu'une proclamation de classe a ete initialisee en brouillon.
export class ProclamationClasseInitialisee extends EvenementDomaine {
  public readonly idProclamationClasse: string;
  public readonly idClassePedagogique: string;

  constructor(idProclamationClasse: string, idClassePedagogique: string) {
    super('ProclamationClasseInitialisee');
    this.idProclamationClasse = idProclamationClasse;
    this.idClassePedagogique = idClassePedagogique;
  }
}
