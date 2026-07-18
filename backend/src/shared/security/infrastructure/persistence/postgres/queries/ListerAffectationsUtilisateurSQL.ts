import type { AffectationUtilisateurReadModel, ListerAffectationsUtilisateurQuery } from '../../../../application';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';

export class ListerAffectationsUtilisateurSQL implements ListerAffectationsUtilisateurQuery {
  constructor(private readonly clientSql: SqlQueryClient = obtenirClientPostgresAuth()) {}
  public async executer(idUtilisateur: string): Promise<readonly AffectationUtilisateurReadModel[]> {
    const resultat=await this.clientSql.executer<{id_affectation_utilisateur:string;id_utilisateur:string;id_role:string;niveau_acces:string;etat_affectation:string}>(
      `SELECT id_affectation_utilisateur,id_utilisateur,id_role,niveau_acces,etat_affectation
       FROM security_affectations_utilisateurs WHERE id_utilisateur=$1 ORDER BY cree_le DESC`,[idUtilisateur]);
    return resultat.lignes.map(r=>({idAffectationUtilisateur:r.id_affectation_utilisateur,idUtilisateur:r.id_utilisateur,idRole:r.id_role,niveauAcces:r.niveau_acces,etatAffectation:r.etat_affectation}));
  }
}
