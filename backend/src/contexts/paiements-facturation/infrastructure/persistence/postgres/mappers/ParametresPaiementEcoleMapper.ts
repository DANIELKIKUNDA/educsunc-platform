// Ce fichier porte le mapper documentaire des parametres de paiement de l'ecole.

import { ParametresPaiementEcole } from '../../../../domain/aggregates/ParametresPaiementEcole';
import {
  MappersPaiementsPostgres,
  type PersistanceParametresPaiementEcolePostgres,
} from './MappersPaiementsPostgres';

// Ce mapper convertit l'agregat ParametresPaiementEcole entre domaine et PostgreSQL.
export class ParametresPaiementEcoleMapper {
  // Cette methode convertit l'agregat vers la persistance.
  public static versPersistance(
    parametres: ParametresPaiementEcole,
  ): PersistanceParametresPaiementEcolePostgres {
    return MappersPaiementsPostgres.versPersistanceParametres(parametres);
  }

  // Cette methode reconstruit l'agregat depuis la persistance.
  public static depuisPersistance(
    ligne: PersistanceParametresPaiementEcolePostgres,
  ): ParametresPaiementEcole {
    return MappersPaiementsPostgres.depuisPersistanceParametres(ligne);
  }
}
