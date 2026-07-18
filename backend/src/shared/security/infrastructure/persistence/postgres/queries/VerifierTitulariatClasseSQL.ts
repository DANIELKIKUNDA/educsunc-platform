import type { VerifierTitulariatClasseQuery } from '../../../../application';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';
export class VerifierTitulariatClasseSQL implements VerifierTitulariatClasseQuery{
 constructor(private readonly clientSql:SqlQueryClient=obtenirClientPostgresAuth()){}
 public async executer(idClasse:string,idAnnee:string):Promise<boolean>{const r=await this.clientSql.executer<{existe:boolean}>(
  'SELECT EXISTS(SELECT 1 FROM security_affectations_titulariat WHERE id_classe=$1 AND id_annee_scolaire=$2 AND est_actif=TRUE) existe',[idClasse,idAnnee]);return r.lignes[0]?.existe??false;}
}
