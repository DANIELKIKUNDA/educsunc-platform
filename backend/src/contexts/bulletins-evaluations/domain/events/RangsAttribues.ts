import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique que les rangs d'une colonne ont ete attribues.
export class RangsAttribues extends EvenementDomaine {
  public readonly idClassementColonneClasse: string;

  constructor(idClassementColonneClasse: string) {
    super('RangsAttribues');
    this.idClassementColonneClasse = idClassementColonneClasse;
  }
}
