import type { AffectationUtilisateurRepositoryPort } from '../../../../application';
import type { AffectationUtilisateur } from '../../../../domain';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';
import { AffectationPersistenceMapper, type AffectationUtilisateurRecord, type ScopeAccesRecord } from '../mappers';

type ClientTransactionnel = SqlQueryClient & { dansTransaction?<T>(operation: () => Promise<T>): Promise<T> };
type AffectationRow = Omit<AffectationUtilisateurRecord, 'scopes'>;

export class PostgresAffectationUtilisateurRepository implements AffectationUtilisateurRepositoryPort {
  constructor(private readonly clientSql: ClientTransactionnel = obtenirClientPostgresAuth()) {}

  public async sauvegarder(affectation: AffectationUtilisateur): Promise<void> {
    await this.dansTransaction(async () => {
      const record = AffectationPersistenceMapper.versRecord(affectation);
      const resultat = await this.clientSql.executer(
        `INSERT INTO security_affectations_utilisateurs (
           id_affectation_utilisateur, id_utilisateur, id_role, niveau_acces,
           id_organisation, id_ecole, id_section, id_classe, id_cours,
           etat_affectation, date_debut, date_fin, cree_le, cree_par, version
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         ON CONFLICT (id_affectation_utilisateur) DO UPDATE SET
           id_role = EXCLUDED.id_role, niveau_acces = EXCLUDED.niveau_acces,
           id_organisation = EXCLUDED.id_organisation, id_ecole = EXCLUDED.id_ecole,
           id_section = EXCLUDED.id_section, id_classe = EXCLUDED.id_classe,
           id_cours = EXCLUDED.id_cours, etat_affectation = EXCLUDED.etat_affectation,
           date_fin = EXCLUDED.date_fin, version = EXCLUDED.version
         WHERE security_affectations_utilisateurs.version < EXCLUDED.version`,
        [record.id_affectation_utilisateur, record.id_utilisateur, record.id_role,
          record.niveau_acces, record.id_organisation ?? null, record.id_ecole ?? null,
          record.id_section ?? null, record.id_classe ?? null, record.id_cours ?? null,
          record.etat_affectation, record.date_debut, record.date_fin ?? null,
          record.cree_le, record.cree_par ?? null, record.version],
      );
      if (resultat.nombreLignesAffectees === 0) {
        throw new Error("Conflit de version lors de la sauvegarde de l'affectation.");
      }
      await this.clientSql.executer(
        'DELETE FROM security_scopes_acces WHERE id_affectation_utilisateur = $1',
        [record.id_affectation_utilisateur],
      );
      for (const scope of record.scopes) {
        await this.clientSql.executer(
          `INSERT INTO security_scopes_acces
             (id_scope_acces, id_affectation_utilisateur, type_scope, valeur_scope, est_lecture_seule)
           VALUES ($1,$2,$3,$4,$5)`,
          [scope.id_scope_acces, record.id_affectation_utilisateur, scope.type_scope,
            scope.valeur_scope, scope.est_lecture_seule],
        );
      }
    });
  }

  public async trouverParId(id: string): Promise<AffectationUtilisateur | null> {
    const resultat = await this.clientSql.executer<AffectationRow>(
      'SELECT * FROM security_affectations_utilisateurs WHERE id_affectation_utilisateur = $1', [id],
    );
    return resultat.lignes[0] ? this.hydrater(resultat.lignes[0]) : null;
  }

  public async listerActivesParUtilisateur(idUtilisateur: string): Promise<readonly AffectationUtilisateur[]> {
    return this.listerParUtilisateur(idUtilisateur, true);
  }

  public async listerParUtilisateur(idUtilisateur: string, activesSeulement = false): Promise<readonly AffectationUtilisateur[]> {
    const resultat = await this.clientSql.executer<AffectationRow>(
      `SELECT * FROM security_affectations_utilisateurs
       WHERE id_utilisateur = $1 ${activesSeulement ? "AND etat_affectation = 'ACTIVE' AND (date_fin IS NULL OR date_fin > NOW())" : ''}
       ORDER BY cree_le DESC`, [idUtilisateur],
    );
    return Promise.all(resultat.lignes.map((ligne) => this.hydrater(ligne)));
  }

  public async compterUtilisateursActifsOrganisation(idOrganisation: string): Promise<number> {
    const resultat = await this.clientSql.executer<{ total: string | number }>(
      `SELECT COUNT(DISTINCT id_utilisateur) AS total
       FROM security_affectations_utilisateurs
       WHERE id_organisation = $1 AND etat_affectation = 'ACTIVE'
         AND (date_fin IS NULL OR date_fin > NOW())`, [idOrganisation],
    );
    return Number(resultat.lignes[0]?.total ?? 0);
  }

  private async hydrater(ligne: AffectationRow): Promise<AffectationUtilisateur> {
    const scopes = await this.clientSql.executer<ScopeAccesRecord>(
      'SELECT * FROM security_scopes_acces WHERE id_affectation_utilisateur = $1 ORDER BY type_scope, valeur_scope',
      [ligne.id_affectation_utilisateur],
    );
    return AffectationPersistenceMapper.depuisRecord({...ligne, scopes: [...scopes.lignes]});
  }

  private async dansTransaction<T>(operation: () => Promise<T>): Promise<T> {
    return this.clientSql.dansTransaction ? this.clientSql.dansTransaction(operation) : operation();
  }
}
