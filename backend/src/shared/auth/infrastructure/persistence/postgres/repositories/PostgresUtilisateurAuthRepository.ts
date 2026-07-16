import { DepotUtilisateurAuth, UtilisateurAuth } from '../../../../domain';
import { UtilisateurAuthPersistenceMapper } from '../mappers';
import { obtenirClientPostgresAuth } from '../ClientPoolPostgresAuth';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';

// Ce depot persiste les utilisateurs AUTH dans PostgreSQL sans fallback memoire.
export class PostgresUtilisateurAuthRepository implements DepotUtilisateurAuth {
  constructor(private readonly clientSql: SqlQueryClient = obtenirClientPostgresAuth()) {}

  public async sauvegarder(utilisateur: UtilisateurAuth): Promise<void> {
    const record = UtilisateurAuthPersistenceMapper.versRecord(utilisateur);
    const resultat = await this.clientSql.executer(
      `INSERT INTO auth_utilisateurs (
         id_utilisateur, nom_complet, email, telephone, mot_de_passe_hash,
         etat_compte, token_version, dernier_acces_le, dernier_login_le,
         nombre_tentatives_connexion, compte_verrouille_jusqua,
         auth_offline_autorisee, cree_le, modifie_le, version, supprime_logiquement
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       ON CONFLICT (id_utilisateur) DO UPDATE SET
         nom_complet = EXCLUDED.nom_complet,
         email = EXCLUDED.email,
         telephone = EXCLUDED.telephone,
         mot_de_passe_hash = EXCLUDED.mot_de_passe_hash,
         etat_compte = EXCLUDED.etat_compte,
         token_version = EXCLUDED.token_version,
         dernier_acces_le = EXCLUDED.dernier_acces_le,
         dernier_login_le = EXCLUDED.dernier_login_le,
         nombre_tentatives_connexion = EXCLUDED.nombre_tentatives_connexion,
         compte_verrouille_jusqua = EXCLUDED.compte_verrouille_jusqua,
         auth_offline_autorisee = EXCLUDED.auth_offline_autorisee,
         modifie_le = EXCLUDED.modifie_le,
         version = EXCLUDED.version,
         supprime_logiquement = EXCLUDED.supprime_logiquement
       WHERE auth_utilisateurs.version < EXCLUDED.version`,
      [
        record.id_utilisateur, record.nom_complet, record.email.toLowerCase(), record.telephone,
        record.mot_de_passe_hash, record.etat_compte, record.token_version,
        record.dernier_acces_le, record.dernier_login_le, record.nombre_tentatives_connexion,
        record.compte_verrouille_jusqua, record.auth_offline_autorisee, record.cree_le,
        record.modifie_le, record.version, record.supprime_logiquement,
      ],
    );
    if (resultat.nombreLignesAffectees === 0) {
      throw new Error('Conflit de version lors de la sauvegarde du compte Auth.');
    }
  }

  public async trouverParId(idUtilisateur: string): Promise<UtilisateurAuth | null> {
    const resultat = await this.clientSql.executer<ReturnType<typeof UtilisateurAuthPersistenceMapper.versRecord>>(
      'SELECT * FROM auth_utilisateurs WHERE id_utilisateur = $1 AND supprime_logiquement = FALSE',
      [idUtilisateur],
    );
    const record = resultat.lignes[0];
    return record ? UtilisateurAuthPersistenceMapper.depuisRecord(record) : null;
  }

  public async trouverParEmail(email: string): Promise<UtilisateurAuth | null> {
    const resultat = await this.clientSql.executer<ReturnType<typeof UtilisateurAuthPersistenceMapper.versRecord>>(
      'SELECT * FROM auth_utilisateurs WHERE email = $1 AND supprime_logiquement = FALSE',
      [String(email || '').trim().toLowerCase()],
    );
    const record = resultat.lignes[0];
    return record ? UtilisateurAuthPersistenceMapper.depuisRecord(record) : null;
  }

  public async existeEmail(email: string): Promise<boolean> {
    const resultat = await this.clientSql.executer<{ existe: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM auth_utilisateurs WHERE email = $1 AND supprime_logiquement = FALSE) AS existe',
      [String(email || '').trim().toLowerCase()],
    );
    return resultat.lignes[0]?.existe ?? false;
  }
}
