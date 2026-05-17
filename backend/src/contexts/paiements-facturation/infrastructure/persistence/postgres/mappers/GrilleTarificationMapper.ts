// Ce fichier porte le mapper documentaire de la grille de tarification.

import { GrilleTarification } from '../../../../domain/aggregates/GrilleTarification';
import {
  MappersPaiementsPostgres,
  type PersistanceGrilleTarificationPostgres,
} from './MappersPaiementsPostgres';

// Ce mapper convertit l'agregat GrilleTarification entre domaine et PostgreSQL.
export class GrilleTarificationMapper {
  public static versPersistance(
    grille: GrilleTarification,
  ): PersistanceGrilleTarificationPostgres {
    return MappersPaiementsPostgres.versPersistanceGrille(grille);
  }

  public static depuisPersistance(
    ligne: PersistanceGrilleTarificationPostgres,
  ): GrilleTarification {
    return MappersPaiementsPostgres.depuisPersistanceGrille(ligne);
  }
}
