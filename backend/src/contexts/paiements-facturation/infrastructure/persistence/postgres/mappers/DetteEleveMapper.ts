// Ce fichier porte le mapper documentaire de la dette consolidee d'un eleve.

import { DetteEleve } from '../../../../domain/aggregates/DetteEleve';
import {
  MappersPaiementsPostgres,
  type PersistanceDetteElevePostgres,
} from './MappersPaiementsPostgres';

// Ce mapper convertit l'agregat DetteEleve entre domaine et PostgreSQL.
export class DetteEleveMapper {
  public static versPersistance(
    dette: DetteEleve,
  ): PersistanceDetteElevePostgres {
    return MappersPaiementsPostgres.versPersistanceDette(dette);
  }

  public static depuisPersistance(
    ligne: PersistanceDetteElevePostgres,
  ): DetteEleve {
    return MappersPaiementsPostgres.depuisPersistanceDette(ligne);
  }
}
