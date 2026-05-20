import { ContexteActifAuth } from '../../../../domain';

export interface ContexteActifAuthRecord {
  id_contexte_actif_auth: string;
  id_utilisateur: string;
  organisation_active_id?: string;
  ecole_active_id?: string;
  dernier_changement_le?: string;
  version: number;
}

// Ce mapper convertit un contexte actif AUTH entre domaine et persistance.
export class ContexteActifAuthPersistenceMapper {
  public static versRecord(contexteActif: ContexteActifAuth): ContexteActifAuthRecord {
    return {
      id_contexte_actif_auth: contexteActif.obtenirId(),
      id_utilisateur: contexteActif.obtenirIdUtilisateur(),
      organisation_active_id: contexteActif.obtenirOrganisationActiveId(),
      ecole_active_id: contexteActif.obtenirEcoleActiveId(),
      dernier_changement_le: contexteActif.obtenirDernierChangementLe()?.toISOString(),
      version: contexteActif.obtenirVersion(),
    };
  }

  public static depuisRecord(record: ContexteActifAuthRecord): ContexteActifAuth {
    return new ContexteActifAuth({
      idContexteActifAuth: record.id_contexte_actif_auth,
      idUtilisateur: record.id_utilisateur,
      organisationActiveId: record.organisation_active_id,
      ecoleActiveId: record.ecole_active_id,
      dernierChangementLe: record.dernier_changement_le ? new Date(record.dernier_changement_le) : undefined,
      version: record.version,
    });
  }
}
