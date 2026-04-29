import { PlanAnticipationFrais } from '../aggregates/PlanAnticipationFrais';

export interface DepotPlanAnticipationFrais {
  sauvegarder(plan: PlanAnticipationFrais): Promise<void>;
  trouverParId(idPlanAnticipation: string): Promise<PlanAnticipationFrais | null>;
  listerActifsParEcoleEtAnnee(idEcole: string, idAnneeScolaire: string): Promise<PlanAnticipationFrais[]>;
}
