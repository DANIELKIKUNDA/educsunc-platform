import type { VerifierPermissionQuery } from '../../../../application';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';
export class VerifierPermissionSQL implements VerifierPermissionQuery{
 constructor(private readonly clientSql:SqlQueryClient=obtenirClientPostgresAuth()){}
 public async executer(idUtilisateur:string,permission:string):Promise<boolean>{const r=await this.clientSql.executer<{existe:boolean}>(
  `SELECT EXISTS(SELECT 1 FROM security_affectations_utilisateurs a JOIN security_roles r ON r.id_role=a.id_role
   JOIN security_permissions_roles p ON p.id_role=r.id_role WHERE a.id_utilisateur=$1 AND a.etat_affectation='ACTIVE'
   AND (a.date_fin IS NULL OR a.date_fin>NOW()) AND r.est_actif=TRUE AND p.permission=$2) existe`,[idUtilisateur,permission]);return r.lignes[0]?.existe??false;}
}
