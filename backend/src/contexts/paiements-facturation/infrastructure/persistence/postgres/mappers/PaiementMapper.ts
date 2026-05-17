// Ce fichier porte le mapper documentaire du paiement.

import { Paiement } from '../../../../domain/aggregates/Paiement';
import type { RepartitionPaiement } from '../../../../domain/entities/RepartitionPaiement';
import {
  MappersPaiementsPostgres,
  type PersistancePaiementPostgres,
} from './MappersPaiementsPostgres';

// Ce mapper convertit l'agregat Paiement entre domaine et PostgreSQL.
export class PaiementMapper {
  public static versPersistance(
    paiement: Paiement,
  ): PersistancePaiementPostgres {
    return MappersPaiementsPostgres.versPersistancePaiement(paiement);
  }

  public static depuisPersistance(
    ligne: PersistancePaiementPostgres,
    repartitions: RepartitionPaiement[],
  ): Paiement {
    return MappersPaiementsPostgres.depuisPersistancePaiement(
      ligne,
      repartitions,
    );
  }
}
