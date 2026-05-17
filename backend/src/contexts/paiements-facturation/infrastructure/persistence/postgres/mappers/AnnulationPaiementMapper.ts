// Ce fichier porte le mapper documentaire des annulations de paiement.

import { AnnulationPaiement } from '../../../../domain/aggregates/AnnulationPaiement';
import type { OperationInverse } from '../../../../domain/entities/OperationInverse';
import {
  MappersPaiementsPostgres,
  type PersistanceAnnulationPaiementPostgres,
} from './MappersPaiementsPostgres';

// Ce mapper convertit l'agregat AnnulationPaiement entre domaine et PostgreSQL.
export class AnnulationPaiementMapper {
  public static versPersistance(
    annulation: AnnulationPaiement,
  ): PersistanceAnnulationPaiementPostgres {
    return MappersPaiementsPostgres.versPersistanceAnnulation(annulation);
  }

  public static depuisPersistance(
    ligne: PersistanceAnnulationPaiementPostgres,
    operationsInverses: OperationInverse[],
  ): AnnulationPaiement {
    return MappersPaiementsPostgres.depuisPersistanceAnnulation(
      ligne,
      operationsInverses,
    );
  }
}
