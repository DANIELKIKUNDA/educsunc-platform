import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique que les non classes ont ete exclus du classement.
export class ElevesNonClassesExclusClassement extends EvenementDomaine {
  public readonly idClassementColonneClasse: string;

  constructor(idClassementColonneClasse: string) {
    super('ElevesNonClassesExclusClassement');
    this.idClassementColonneClasse = idClassementColonneClasse;
  }
}
