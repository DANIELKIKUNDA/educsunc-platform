import type { ContexteActifReadModel, ObtenirContexteActifQuery } from '../../../../application';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';
export class ObtenirContexteActifSQL implements ObtenirContexteActifQuery{
 constructor(private readonly clientSql:SqlQueryClient=obtenirClientPostgresAuth()){}
 public async executer(idUtilisateur:string):Promise<ContexteActifReadModel|null>{const r=await this.clientSql.executer<{organisation_active_id?:string;ecole_active_id?:string}>(
  'SELECT organisation_active_id,ecole_active_id FROM auth_contextes_actifs WHERE id_utilisateur=$1',[idUtilisateur]);const x=r.lignes[0];return x?{idOrganisationActive:x.organisation_active_id,idEcoleActive:x.ecole_active_id}:null;}
}
