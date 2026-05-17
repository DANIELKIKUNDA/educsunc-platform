// Ce fichier porte le mapper documentaire des restitutions d'excedent.

import { Restitution } from '../../../../domain/aggregates/Restitution';
import {
  MappersPaiementsPostgres,
  type PersistanceRestitutionPostgres,
} from './MappersPaiementsPostgres';

// Ce mapper convertit l'agregat Restitution entre domaine et PostgreSQL.
export class RestitutionMapper {
  public static versPersistance(
    restitution: Restitution,
  ): PersistanceRestitutionPostgres {
    return MappersPaiementsPostgres.versPersistanceRestitution(restitution);
  }

  public static depuisPersistance(
    ligne: PersistanceRestitutionPostgres,
  ): Restitution {
    return MappersPaiementsPostgres.depuisPersistanceRestitution(ligne);
  }
}
