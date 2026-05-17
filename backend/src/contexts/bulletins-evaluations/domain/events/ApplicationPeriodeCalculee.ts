import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique que l'application d'une periode a ete calculee.
export class ApplicationPeriodeCalculee extends EvenementDomaine {
  public readonly idResultatBulletinEleve: string;
  public readonly codePeriode: string;

  constructor(idResultatBulletinEleve: string, codePeriode: string) {
    super('ApplicationPeriodeCalculee');
    this.idResultatBulletinEleve = idResultatBulletinEleve;
    this.codePeriode = codePeriode;
  }
}
