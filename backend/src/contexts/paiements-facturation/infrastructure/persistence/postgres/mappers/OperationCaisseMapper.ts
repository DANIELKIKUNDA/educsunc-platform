// Ce fichier porte le mapper documentaire des operations de caisse.

import { OperationCaisse } from '../../../../domain/entities/OperationCaisse';
import {
  MappersPaiementsPostgres,
  type PersistanceOperationCaissePostgres,
} from './MappersPaiementsPostgres';

// Ce mapper convertit l'entite OperationCaisse entre domaine et PostgreSQL.
export class OperationCaisseMapper {
  public static versPersistance(
    operation: OperationCaisse,
  ): PersistanceOperationCaissePostgres {
    return MappersPaiementsPostgres.versPersistanceOperationCaisse(operation);
  }

  public static depuisPersistance(
    ligne: PersistanceOperationCaissePostgres,
  ): OperationCaisse {
    return MappersPaiementsPostgres.depuisPersistanceOperationCaisse(ligne);
  }
}
