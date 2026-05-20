import { AffectationUtilisateur, EtatAffectation, NiveauAcces, ScopeAcces, TypeScope, type ProprietesAffectationUtilisateur } from '../../../../domain';

export interface ScopeAccesRecord {
  id_scope_acces: string;
  id_affectation_utilisateur: string;
  type_scope: string;
  valeur_scope: string;
  est_lecture_seule: boolean;
}

export interface AffectationUtilisateurRecord {
  id_affectation_utilisateur: string;
  id_utilisateur: string;
  id_role: string;
  niveau_acces: string;
  id_organisation?: string;
  id_ecole?: string;
  id_section?: string;
  id_classe?: string;
  id_cours?: string;
  etat_affectation: string;
  date_debut: string;
  date_fin?: string;
  cree_le: string;
  cree_par?: string;
  version: number;
  scopes: ScopeAccesRecord[];
}

// Ce mapper convertit les affectations utilisateurs entre domaine et persistance.
export class AffectationPersistenceMapper {
  public static versRecord(affectation: AffectationUtilisateur): AffectationUtilisateurRecord {
    return {
      id_affectation_utilisateur: affectation.obtenirId(),
      id_utilisateur: affectation.obtenirIdUtilisateur(),
      id_role: affectation.obtenirIdRole(),
      niveau_acces: affectation.obtenirNiveauAcces().obtenirValeur(),
      id_organisation: affectation.obtenirIdOrganisation(),
      id_ecole: affectation.obtenirIdEcole(),
      id_section: affectation.obtenirIdSection(),
      etat_affectation: affectation.obtenirEtatAffectation().obtenirValeur(),
      date_debut: affectation.obtenirDateDebut().toISOString(),
      date_fin: affectation.obtenirDateFin()?.toISOString(),
      cree_le: affectation.obtenirCreeLe().toISOString(),
      cree_par: affectation.obtenirCreePar(),
      version: 1,
      scopes: affectation.obtenirScopes().map((scope) => ScopePersistenceMapper.versRecord(scope, affectation.obtenirId())),
    };
  }

  public static depuisRecord(record: AffectationUtilisateurRecord): AffectationUtilisateur {
    const proprietes: ProprietesAffectationUtilisateur = {
      idAffectationUtilisateur: record.id_affectation_utilisateur,
      idUtilisateur: record.id_utilisateur,
      idRole: record.id_role,
      niveauAcces: new NiveauAcces(record.niveau_acces),
      idOrganisation: record.id_organisation,
      idEcole: record.id_ecole,
      idSection: record.id_section,
      idClasse: record.id_classe,
      idCours: record.id_cours,
      etatAffectation: new EtatAffectation(record.etat_affectation),
      dateDebut: new Date(record.date_debut),
      dateFin: record.date_fin ? new Date(record.date_fin) : undefined,
      creeLe: new Date(record.cree_le),
      creePar: record.cree_par,
      version: record.version,
      scopes: record.scopes.map((scope) => ScopePersistenceMapper.depuisRecord(scope)),
    };

    return new AffectationUtilisateur(proprietes);
  }
}

// Ce mapper gere la conversion des scopes rattaches a une affectation.
export class ScopePersistenceMapper {
  public static versRecord(scope: ScopeAcces, idAffectationUtilisateur: string): ScopeAccesRecord {
    return {
      id_scope_acces: scope.obtenirId(),
      id_affectation_utilisateur: idAffectationUtilisateur,
      type_scope: scope.obtenirTypeScope().obtenirValeur(),
      valeur_scope: scope.obtenirValeurScope(),
      est_lecture_seule: scope.obtenirEstLectureSeule(),
    };
  }

  public static depuisRecord(record: ScopeAccesRecord): ScopeAcces {
    return new ScopeAcces({
      idScopeAcces: record.id_scope_acces,
      typeScope: new TypeScope(record.type_scope),
      valeurScope: record.valeur_scope,
      estLectureSeule: record.est_lecture_seule,
    });
  }
}
