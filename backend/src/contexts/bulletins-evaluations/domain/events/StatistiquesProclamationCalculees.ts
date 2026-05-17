import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique que les statistiques d'une proclamation ont ete calculees.
export class StatistiquesProclamationCalculees extends EvenementDomaine {
  public readonly idProclamationClasse: string;

  constructor(idProclamationClasse: string) {
    super('StatistiquesProclamationCalculees');
    this.idProclamationClasse = idProclamationClasse;
  }
}
