import { AffectationTitulariat, type ProprietesAffectationTitulariat } from '../../../../domain';

export interface TitulariatRecord {
  id_affectation_titulariat: string;
  id_utilisateur: string;
  id_classe: string;
  id_annee_scolaire: string;
  est_actif: boolean;
  date_debut: string;
  date_fin?: string;
  cree_le: string;
  cree_par?: string;
  version: number;
}

// Ce mapper convertit le titulariat entre agregat domaine et enregistrement PostgreSQL.
export class TitulariatPersistenceMapper {
  public static versRecord(titulariat: AffectationTitulariat): TitulariatRecord {
    return {
      id_affectation_titulariat: titulariat.obtenirId(),
      id_utilisateur: titulariat.obtenirIdUtilisateur(),
      id_classe: titulariat.obtenirIdClasse(),
      id_annee_scolaire: titulariat.obtenirIdAnneeScolaire(),
      est_actif: titulariat.obtenirEstActif(),
      date_debut: titulariat.obtenirDateDebut().toISOString(),
      date_fin: titulariat.obtenirDateFin()?.toISOString(),
      cree_le: titulariat.obtenirCreeLe().toISOString(),
      cree_par: titulariat.obtenirCreePar(),
      version: 1,
    };
  }

  public static depuisRecord(record: TitulariatRecord): AffectationTitulariat {
    const proprietes: ProprietesAffectationTitulariat = {
      idAffectationTitulariat: record.id_affectation_titulariat,
      idUtilisateur: record.id_utilisateur,
      idClasse: record.id_classe,
      idAnneeScolaire: record.id_annee_scolaire,
      estActif: record.est_actif,
      dateDebut: new Date(record.date_debut),
      dateFin: record.date_fin ? new Date(record.date_fin) : undefined,
      creeLe: new Date(record.cree_le),
      creePar: record.cree_par,
      version: record.version,
    };

    return new AffectationTitulariat(proprietes);
  }
}
