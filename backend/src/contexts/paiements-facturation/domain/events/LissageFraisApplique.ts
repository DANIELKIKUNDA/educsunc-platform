import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

export class LissageFraisApplique extends EvenementDomaine {
  public readonly idPlanAnticipation: string;
  public readonly idObligation: string;
  public readonly idEcole: string;

  constructor(idPlanAnticipation: string, idObligation: string, idEcole: string) {
    super('LissageFraisApplique');
    this.idPlanAnticipation = idPlanAnticipation;
    this.idObligation = idObligation;
    this.idEcole = idEcole;
  }
}
