import type { AffectationTitulariatRepositoryPort } from '../../../../application';
import type { AffectationTitulariat } from '../../../../domain';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';
import { TitulariatPersistenceMapper, type TitulariatRecord } from '../mappers';

export class PostgresAffectationTitulariatRepository implements AffectationTitulariatRepositoryPort {
  constructor(private readonly clientSql: SqlQueryClient = obtenirClientPostgresAuth()) {}

  public async sauvegarder(titulariat: AffectationTitulariat): Promise<void> {
    const record = TitulariatPersistenceMapper.versRecord(titulariat);
    const resultat = await this.clientSql.executer(
      `INSERT INTO security_affectations_titulariat (
         id_affectation_titulariat, id_utilisateur, id_organisation, id_ecole,
         id_classe, id_annee_scolaire, est_actif, date_debut, date_fin,
         cree_le, cree_par, version
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (id_affectation_titulariat) DO UPDATE SET
         est_actif = EXCLUDED.est_actif, date_fin = EXCLUDED.date_fin,
         version = EXCLUDED.version
       WHERE security_affectations_titulariat.version < EXCLUDED.version`,
      [record.id_affectation_titulariat, record.id_utilisateur, record.id_organisation,
        record.id_ecole, record.id_classe, record.id_annee_scolaire, record.est_actif,
        record.date_debut, record.date_fin ?? null, record.cree_le, record.cree_par ?? null,
        record.version],
    );
    if (resultat.nombreLignesAffectees === 0) {
      throw new Error('Conflit de version lors de la sauvegarde du titulariat.');
    }
  }

  public async trouverActifParClasse(idClasse: string, idAnnee: string): Promise<AffectationTitulariat | null> {
    const resultat = await this.clientSql.executer<TitulariatRecord>(
      `SELECT * FROM security_affectations_titulariat
       WHERE id_classe = $1 AND id_annee_scolaire = $2 AND est_actif = TRUE
       ORDER BY date_debut DESC LIMIT 1`, [idClasse, idAnnee],
    );
    return resultat.lignes[0] ? TitulariatPersistenceMapper.depuisRecord(resultat.lignes[0]) : null;
  }

  public async listerActifsParUtilisateur(idUtilisateur: string): Promise<readonly AffectationTitulariat[]> {
    const resultat = await this.clientSql.executer<TitulariatRecord>(
      `SELECT * FROM security_affectations_titulariat
       WHERE id_utilisateur = $1 AND est_actif = TRUE ORDER BY date_debut DESC`, [idUtilisateur],
    );
    return resultat.lignes.map((ligne) => TitulariatPersistenceMapper.depuisRecord(ligne));
  }
}
