import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement signale qu'un bulletin vient d'etre valide officiellement.
export class BulletinValideOfficiellement extends EvenementDomaine {
  public readonly idBulletinEleve: string;
  public readonly versionBulletin: number;
  public readonly validePar: string;
  public readonly roleValidateur: string;
  public readonly dateValidation: Date;

  constructor(
    idBulletinEleve: string,
    versionBulletin: number,
    validePar: string,
    roleValidateur: string,
    dateValidation: Date,
  ) {
    super('BulletinValideOfficiellement');
    this.idBulletinEleve = idBulletinEleve;
    this.versionBulletin = versionBulletin;
    this.validePar = validePar;
    this.roleValidateur = roleValidateur;
    this.dateValidation = dateValidation;
  }
}
