import type { ListerScopesUtilisateurQuery, ScopeUtilisateurReadModel } from '../../../../application';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';

export class ListerScopesUtilisateurSQL implements ListerScopesUtilisateurQuery {
  constructor(private readonly clientSql: SqlQueryClient = obtenirClientPostgresAuth()) {}
  public async executer(idUtilisateur:string):Promise<readonly ScopeUtilisateurReadModel[]>{
    const resultat=await this.clientSql.executer<{type_scope:string;valeur_scope:string;est_lecture_seule:boolean}>(
      `SELECT s.type_scope,s.valeur_scope,s.est_lecture_seule FROM security_scopes_acces s
       JOIN security_affectations_utilisateurs a ON a.id_affectation_utilisateur=s.id_affectation_utilisateur
       WHERE a.id_utilisateur=$1 AND a.etat_affectation='ACTIVE' ORDER BY s.type_scope,s.valeur_scope`,[idUtilisateur]);
    return resultat.lignes.map(r=>({typeScope:r.type_scope,valeurScope:r.valeur_scope,estLectureSeule:r.est_lecture_seule}));
  }
}
