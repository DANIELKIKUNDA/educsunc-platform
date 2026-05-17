import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique qu'un eleve a ete marque non classe.
export class EleveMarqueNonClasse extends EvenementDomaine {
  public readonly idResultatBulletinEleve: string;
  public readonly codeColonne: string;

  constructor(idResultatBulletinEleve: string, codeColonne: string) {
    super('EleveMarqueNonClasse');
    this.idResultatBulletinEleve = idResultatBulletinEleve;
    this.codeColonne = codeColonne;
  }
}
