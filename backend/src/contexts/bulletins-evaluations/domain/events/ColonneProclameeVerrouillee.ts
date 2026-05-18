import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement signale qu'une colonne proclamee a ete verrouillee.
export class ColonneProclameeVerrouillee extends EvenementDomaine {
  public readonly idClassePedagogique: string;
  public readonly idAnneeScolaire: string;
  public readonly codeColonne: string;
  public readonly dateVerrouillage: Date;
  public readonly verrouillePar: string;

  constructor(
    idClassePedagogique: string,
    idAnneeScolaire: string,
    codeColonne: string,
    dateVerrouillage: Date,
    verrouillePar: string,
  ) {
    super('ColonneProclameeVerrouillee');
    this.idClassePedagogique = idClassePedagogique;
    this.idAnneeScolaire = idAnneeScolaire;
    this.codeColonne = codeColonne;
    this.dateVerrouillage = dateVerrouillage;
    this.verrouillePar = verrouillePar;
  }
}
