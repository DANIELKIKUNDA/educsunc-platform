import type { VerifierRestrictionQuery } from '../../../../application';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';
export class VerifierRestrictionSQL implements VerifierRestrictionQuery{
 constructor(private readonly clientSql:SqlQueryClient=obtenirClientPostgresAuth()){}
 public async executer(idUtilisateur:string,code:string):Promise<boolean>{const r=await this.clientSql.executer<{existe:boolean}>(
  `SELECT EXISTS(SELECT 1 FROM security_affectations_utilisateurs a JOIN security_roles r ON r.id_role=a.id_role
   JOIN security_restrictions_roles x ON x.id_role=r.id_role WHERE a.id_utilisateur=$1 AND a.etat_affectation='ACTIVE'
   AND r.est_actif=TRUE AND x.code_restriction=$2) existe`,[idUtilisateur,code]);return r.lignes[0]?.existe??false;}
}
