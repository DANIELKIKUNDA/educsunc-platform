// Ce fichier porte le mapper documentaire des recus de paiement.

import { RecuPaiement } from '../../../../domain/aggregates/RecuPaiement';
import {
  MappersPaiementsPostgres,
  type PersistanceRecuPaiementPostgres,
} from './MappersPaiementsPostgres';

// Ce mapper convertit l'agregat RecuPaiement entre domaine et PostgreSQL.
export class RecuPaiementMapper {
  public static versPersistance(
    recu: RecuPaiement,
  ): PersistanceRecuPaiementPostgres {
    return MappersPaiementsPostgres.versPersistanceRecu(recu);
  }

  public static depuisPersistance(
    ligne: PersistanceRecuPaiementPostgres,
  ): RecuPaiement {
    return MappersPaiementsPostgres.depuisPersistanceRecu(ligne);
  }
}
