import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique que la conduite d'une periode a ete encodee.
export class ConduitePeriodeEncodee extends EvenementDomaine {
  public readonly idResultatBulletinEleve: string;
  public readonly codePeriode: string;

  constructor(idResultatBulletinEleve: string, codePeriode: string) {
    super('ConduitePeriodeEncodee');
    this.idResultatBulletinEleve = idResultatBulletinEleve;
    this.codePeriode = codePeriode;
  }
}
