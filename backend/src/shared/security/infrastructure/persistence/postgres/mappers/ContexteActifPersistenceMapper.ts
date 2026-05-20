import { ContexteActifUtilisateur, type ProprietesContexteActifUtilisateur } from '../../../../domain';

export interface ContexteActifUtilisateurRecord {
  id_contexte_actif_utilisateur: string;
  id_utilisateur: string;
  id_organisation_active?: string;
  id_ecole_active?: string;
  date_changement: string;
  version: number;
}

// Ce mapper convertit le contexte actif entre domaine et persistance.
export class ContexteActifPersistenceMapper {
  public static versRecord(contexte: ContexteActifUtilisateur): ContexteActifUtilisateurRecord {
    return {
      id_contexte_actif_utilisateur: contexte.obtenirId(),
      id_utilisateur: contexte.obtenirIdUtilisateur(),
      id_organisation_active: contexte.obtenirIdOrganisationActive(),
      id_ecole_active: contexte.obtenirIdEcoleActive(),
      date_changement: contexte.obtenirDateChangement().toISOString(),
      version: 1,
    };
  }

  public static depuisRecord(record: ContexteActifUtilisateurRecord): ContexteActifUtilisateur {
    const proprietes: ProprietesContexteActifUtilisateur = {
      idContexteActifUtilisateur: record.id_contexte_actif_utilisateur,
      idUtilisateur: record.id_utilisateur,
      idOrganisationActive: record.id_organisation_active,
      idEcoleActive: record.id_ecole_active,
      dateChangement: new Date(record.date_changement),
      version: record.version,
    };

    return new ContexteActifUtilisateur(proprietes);
  }
}
