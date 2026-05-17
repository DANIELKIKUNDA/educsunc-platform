import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique qu'un classement de colonne a ete recalcule.
export class ClassementColonneRecalcule extends EvenementDomaine {
  public readonly idClassementColonneClasse: string;
  public readonly codeColonne: string;

  constructor(idClassementColonneClasse: string, codeColonne: string) {
    super('ClassementColonneRecalcule');
    this.idClassementColonneClasse = idClassementColonneClasse;
    this.codeColonne = codeColonne;
  }
}
