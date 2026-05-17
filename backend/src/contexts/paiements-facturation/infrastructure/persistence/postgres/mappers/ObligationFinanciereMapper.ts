// Ce fichier porte le mapper documentaire des obligations financieres.

import { ObligationFinanciereEleve } from '../../../../domain/aggregates/ObligationFinanciereEleve';
import {
  MappersPaiementsPostgres,
  type PersistanceObligationFinancierePostgres,
} from './MappersPaiementsPostgres';

// Ce mapper convertit l'agregat ObligationFinanciereEleve entre domaine et PostgreSQL.
export class ObligationFinanciereMapper {
  public static versPersistance(
    obligation: ObligationFinanciereEleve,
  ): PersistanceObligationFinancierePostgres {
    return MappersPaiementsPostgres.versPersistanceObligation(obligation);
  }

  public static depuisPersistance(
    ligne: PersistanceObligationFinancierePostgres,
  ): ObligationFinanciereEleve {
    return MappersPaiementsPostgres.depuisPersistanceObligation(ligne);
  }
}
