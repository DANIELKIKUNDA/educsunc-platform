// Ce fichier porte le mapper documentaire des exonerations.

import { Exoneration } from '../../../../domain/aggregates/Exoneration';
import {
  MappersPaiementsPostgres,
  type PersistanceExonerationPostgres,
} from './MappersPaiementsPostgres';

// Ce mapper convertit l'agregat Exoneration entre domaine et PostgreSQL.
export class ExonerationMapper {
  public static versPersistance(
    exoneration: Exoneration,
  ): PersistanceExonerationPostgres {
    return MappersPaiementsPostgres.versPersistanceExoneration(exoneration);
  }

  public static depuisPersistance(
    ligne: PersistanceExonerationPostgres,
  ): Exoneration {
    return MappersPaiementsPostgres.depuisPersistanceExoneration(ligne);
  }
}
