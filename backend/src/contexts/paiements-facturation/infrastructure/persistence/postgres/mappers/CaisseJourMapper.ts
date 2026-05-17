// Ce fichier porte le mapper documentaire de la caisse journaliere.

import { CaisseJour } from '../../../../domain/aggregates/CaisseJour';
import type { OperationCaisse } from '../../../../domain/entities/OperationCaisse';
import {
  MappersPaiementsPostgres,
  type PersistanceCaisseJourPostgres,
} from './MappersPaiementsPostgres';

// Ce mapper convertit l'agregat CaisseJour entre domaine et PostgreSQL.
export class CaisseJourMapper {
  public static versPersistance(
    caisse: CaisseJour,
  ): PersistanceCaisseJourPostgres {
    return MappersPaiementsPostgres.versPersistanceCaisse(caisse);
  }

  public static depuisPersistance(
    ligne: PersistanceCaisseJourPostgres,
    operations: OperationCaisse[],
  ): CaisseJour {
    return MappersPaiementsPostgres.depuisPersistanceCaisse(ligne, operations);
  }
}
