import { HistoriqueConnexionReadModel, ListerTentativesConnexionQuery } from '../../../../application';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../ClientPoolPostgresAuth';

// Cette query liste l'historique recent des tentatives et connexions AUTH.
export class ListerTentativesConnexionSQL implements ListerTentativesConnexionQuery {
  constructor(private readonly clientSql: SqlQueryClient = obtenirClientPostgresAuth()) {}

  public async executer(idUtilisateur: string): Promise<readonly HistoriqueConnexionReadModel[]> {
    const resultat = await this.clientSql.executer<{
      date_tentative: string;
      adresse_ip?: string;
    }>(
      `SELECT date_tentative, adresse_ip
       FROM auth_tentatives_connexion
       WHERE email = COALESCE(
         (SELECT email FROM auth_utilisateurs WHERE id_utilisateur = $1),
         lower(trim($1))
       )
       ORDER BY date_tentative DESC`,
      [idUtilisateur],
    );
    return resultat.lignes.map((record) => ({
        dateConnexion: record.date_tentative,
        adresseIp: record.adresse_ip,
        deviceId: undefined,
        estOffline: false,
      }));
  }
}
