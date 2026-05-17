import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique que le diagnostic d'echec a ete mis a jour.
export class DiagnosticEchecMisAJour extends EvenementDomaine {
  public readonly idResultatBulletinEleve: string;
  public readonly codeColonne: string;

  constructor(idResultatBulletinEleve: string, codeColonne: string) {
    super('DiagnosticEchecMisAJour');
    this.idResultatBulletinEleve = idResultatBulletinEleve;
    this.codeColonne = codeColonne;
  }
}
