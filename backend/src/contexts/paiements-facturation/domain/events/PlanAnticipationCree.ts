import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

export class PlanAnticipationCree extends EvenementDomaine {
  public readonly idPlanAnticipation: string;
  public readonly idEcole: string;
  public readonly idAnneeScolaire: string;

  constructor(idPlanAnticipation: string, idEcole: string, idAnneeScolaire: string) {
    super('PlanAnticipationCree');
    this.idPlanAnticipation = idPlanAnticipation;
    this.idEcole = idEcole;
    this.idAnneeScolaire = idAnneeScolaire;
  }
}
