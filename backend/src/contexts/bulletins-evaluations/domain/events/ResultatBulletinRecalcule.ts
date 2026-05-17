import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique qu'un resultat consolide a ete recalcule.
export class ResultatBulletinRecalcule extends EvenementDomaine {
  public readonly idResultatBulletinEleve: string;
  public readonly idEleve: string;

  constructor(idResultatBulletinEleve: string, idEleve: string) {
    super('ResultatBulletinRecalcule');
    this.idResultatBulletinEleve = idResultatBulletinEleve;
    this.idEleve = idEleve;
  }
}
