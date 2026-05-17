import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique que les totaux d'une synthese d'ecole ont ete calcules.
export class TotauxSyntheseEcoleCalcules extends EvenementDomaine {
  public readonly idSyntheseResultatsEcole: string;

  constructor(idSyntheseResultatsEcole: string) {
    super('TotauxSyntheseEcoleCalcules');
    this.idSyntheseResultatsEcole = idSyntheseResultatsEcole;
  }
}
