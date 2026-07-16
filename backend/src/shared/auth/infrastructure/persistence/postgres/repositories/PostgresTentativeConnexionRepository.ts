import { DepotTentativeConnexion, TentativeConnexion } from '../../../../domain';
import { TentativeConnexionPersistenceMapper } from '../mappers';
import { obtenirClientPostgresAuth } from '../ClientPoolPostgresAuth';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';

// Ce depot persiste les tentatives de connexion AUTH.
export class PostgresTentativeConnexionRepository implements DepotTentativeConnexion {
  constructor(private readonly clientSql: SqlQueryClient = obtenirClientPostgresAuth()) {}

  public async sauvegarder(tentativeConnexion: TentativeConnexion): Promise<void> {
    const record = TentativeConnexionPersistenceMapper.versRecord(tentativeConnexion);
    await this.clientSql.executer(
      `INSERT INTO auth_tentatives_connexion (
         id_tentative_connexion, email, adresse_ip, user_agent,
         reussie, raison_echec, date_tentative
       ) VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id_tentative_connexion) DO NOTHING`,
      [record.id_tentative_connexion, record.email.toLowerCase(), record.adresse_ip,
        record.user_agent, record.reussie, record.raison_echec, record.date_tentative],
    );
  }

  public async listerTentativesUtilisateur(idUtilisateur: string): Promise<readonly TentativeConnexion[]> {
    const resultat = await this.clientSql.executer<ReturnType<typeof TentativeConnexionPersistenceMapper.versRecord>>(
      `SELECT * FROM auth_tentatives_connexion
       WHERE email = COALESCE(
         (SELECT email FROM auth_utilisateurs WHERE id_utilisateur = $1),
         lower(trim($1))
       )
       ORDER BY date_tentative DESC`,
      [String(idUtilisateur || '').trim()],
    );
    return resultat.lignes.map((record) => TentativeConnexionPersistenceMapper.depuisRecord(record));
  }
}
