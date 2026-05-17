// Ce fichier porte le mapper documentaire des repartitions de paiement.

import { RepartitionPaiement } from '../../../../domain/entities/RepartitionPaiement';
import {
  MappersPaiementsPostgres,
  type PersistanceRepartitionPaiementPostgres,
} from './MappersPaiementsPostgres';

// Ce mapper convertit l'entite RepartitionPaiement entre domaine et PostgreSQL.
export class RepartitionPaiementMapper {
  public static versPersistance(
    repartition: RepartitionPaiement,
  ): PersistanceRepartitionPaiementPostgres {
    return MappersPaiementsPostgres.versPersistanceRepartition(repartition);
  }

  public static depuisPersistance(
    ligne: PersistanceRepartitionPaiementPostgres,
  ): RepartitionPaiement {
    return MappersPaiementsPostgres.depuisPersistanceRepartition(ligne);
  }
}
