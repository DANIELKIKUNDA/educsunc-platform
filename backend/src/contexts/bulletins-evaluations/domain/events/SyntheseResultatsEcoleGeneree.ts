import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique qu'une synthese de resultats d'ecole a ete generee.
export class SyntheseResultatsEcoleGeneree extends EvenementDomaine {
  public readonly idSyntheseResultatsEcole: string;
  public readonly idEcole: string;

  constructor(idSyntheseResultatsEcole: string, idEcole: string) {
    super('SyntheseResultatsEcoleGeneree');
    this.idSyntheseResultatsEcole = idSyntheseResultatsEcole;
    this.idEcole = idEcole;
  }
}
