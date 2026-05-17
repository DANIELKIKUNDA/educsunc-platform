// Ce fichier porte le mapper documentaire des plans d'anticipation de frais.

import { PlanAnticipationFrais } from '../../../../domain/aggregates/PlanAnticipationFrais';
import {
  MappersPaiementsPostgres,
  type PersistancePlanAnticipationFraisPostgres,
} from './MappersPaiementsPostgres';

// Ce mapper convertit l'agregat PlanAnticipationFrais entre domaine et PostgreSQL.
export class PlanAnticipationFraisMapper {
  public static versPersistance(
    plan: PlanAnticipationFrais,
  ): PersistancePlanAnticipationFraisPostgres {
    return MappersPaiementsPostgres.versPersistancePlan(plan);
  }

  public static depuisPersistance(
    ligne: PersistancePlanAnticipationFraisPostgres,
  ): PlanAnticipationFrais {
    return MappersPaiementsPostgres.depuisPersistancePlan(ligne);
  }
}
