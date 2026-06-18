import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement trace l'initialisation d'une synthese ecole avant consolidation.
export class SyntheseResultatsEcoleInitialisee extends EvenementDomaine {
  constructor(
    private readonly idSyntheseResultatsEcole: string,
    private readonly idEcole: string,
  ) {
    super('SyntheseResultatsEcoleInitialisee');
  }

  public obtenirIdSyntheseResultatsEcole(): string {
    return this.idSyntheseResultatsEcole;
  }

  public obtenirIdEcole(): string {
    return this.idEcole;
  }
}
