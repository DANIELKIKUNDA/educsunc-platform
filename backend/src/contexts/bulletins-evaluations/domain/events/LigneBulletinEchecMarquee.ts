import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique qu'une ligne de bulletin a ete marquee en echec visuel.
export class LigneBulletinEchecMarquee extends EvenementDomaine {
  public readonly idBulletinEleve: string;
  public readonly idReferentielCours: string;

  constructor(idBulletinEleve: string, idReferentielCours: string) {
    super('LigneBulletinEchecMarquee');
    this.idBulletinEleve = idBulletinEleve;
    this.idReferentielCours = idReferentielCours;
  }
}
