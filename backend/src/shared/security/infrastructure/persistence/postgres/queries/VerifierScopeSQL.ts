import type { VerifierScopeQuery } from '../../../../application';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';
export class VerifierScopeSQL implements VerifierScopeQuery{
 constructor(private readonly clientSql:SqlQueryClient=obtenirClientPostgresAuth()){}
 public async executer(idUtilisateur:string,idOrganisation?:string,idEcole?:string):Promise<boolean>{const r=await this.clientSql.executer<{existe:boolean}>(
  `SELECT EXISTS(SELECT 1 FROM security_affectations_utilisateurs a WHERE a.id_utilisateur=$1 AND a.etat_affectation='ACTIVE'
   AND ($2::text IS NULL OR a.id_organisation=$2 OR a.niveau_acces='PLATEFORME')
   AND ($3::text IS NULL OR a.id_ecole=$3 OR (a.id_ecole IS NULL AND a.niveau_acces IN ('PLATEFORME','ORGANISATION')))) existe`,
  [idUtilisateur,idOrganisation??null,idEcole??null]);return r.lignes[0]?.existe??false;}
}
