import { AffectationClasse } from '../../../../domain/aggregates/AffectationClasse';
import { DepotAffectationClasse } from '../../../../domain/repositories/DepotAffectationClasse';
import { UUID } from '../../../../domain/value-objects/TypesPrimitifs';
import { AffectationPersistenceMapper, AffectationRow } from '../mappers/AffectationPersistenceMapper';
import { BaseDepotPostgresScolariteEleves } from './BaseDepotPostgresScolariteEleves';

// Ce fichier implemente le depot PostgreSQL des affectations de classe.
export class PostgresAffectationDepot extends BaseDepotPostgresScolariteEleves implements DepotAffectationClasse {
  /** Sauvegarde une affectation par upsert technique. */
  public async sauvegarder(affectation: AffectationClasse): Promise<void> {
    const ligne = AffectationPersistenceMapper.versLigne(affectation);
    this.verifierEcritureTenant(ligne.id_organisation, ligne.id_ecole);
    await this.executerCommande(
      `INSERT INTO affectations (
        id, id_organisation, id_ecole, id_inscription_scolaire, id_classe_pedagogique,
        date_affectation, motif_affectation, active, cree_par, cree_le, modifie_par,
        modifie_le, version, supprime_logiquement
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      ON CONFLICT (id) DO UPDATE SET
        id_classe_pedagogique = EXCLUDED.id_classe_pedagogique,
        motif_affectation = EXCLUDED.motif_affectation, active = EXCLUDED.active,
        modifie_par = EXCLUDED.modifie_par, modifie_le = EXCLUDED.modifie_le,
        version = EXCLUDED.version, supprime_logiquement = EXCLUDED.supprime_logiquement`,
      [
        ligne.id, ligne.id_organisation, ligne.id_ecole, ligne.id_inscription_scolaire,
        ligne.id_classe_pedagogique, ligne.date_affectation, ligne.motif_affectation,
        ligne.active, ligne.cree_par, ligne.cree_le, ligne.modifie_par, ligne.modifie_le,
        ligne.version, ligne.supprime_logiquement,
      ],
    );
  }

  /** Recherche une affectation par identifiant. */
  public async trouverParId(idAffectationClasse: UUID): Promise<AffectationClasse | null> {
    const ligne = await this.executerRequeteUnique<AffectationRow>('SELECT * FROM affectations WHERE id = $1 LIMIT 1', [idAffectationClasse]);
    return ligne === null ? null : AffectationPersistenceMapper.depuisLigne(ligne);
  }

  /** Recherche l'affectation active d'une inscription. */
  public async trouverAffectationActiveParInscription(idInscriptionScolaire: UUID): Promise<AffectationClasse | null> {
    const ligne = await this.executerRequeteUnique<AffectationRow>('SELECT * FROM affectations WHERE id_inscription_scolaire = $1 AND active = true LIMIT 1', [idInscriptionScolaire]);
    return ligne === null ? null : AffectationPersistenceMapper.depuisLigne(ligne);
  }

  /** Liste les affectations actives d'une classe. */
  public async listerActivesParClasse(idClassePedagogique: UUID): Promise<AffectationClasse[]> {
    const lignes = await this.executerRequete<AffectationRow>('SELECT * FROM affectations WHERE id_classe_pedagogique = $1 AND active = true ORDER BY date_affectation DESC', [idClassePedagogique]);
    return lignes.map(AffectationPersistenceMapper.depuisLigne);
  }

  /** Liste les affectations actives d'une ecole. */
  public async listerActivesParEcole(idEcole: UUID): Promise<AffectationClasse[]> {
    const lignes = await this.executerRequete<AffectationRow>('SELECT * FROM affectations WHERE id_ecole = $1 AND active = true ORDER BY date_affectation DESC', [idEcole]);
    return lignes.map(AffectationPersistenceMapper.depuisLigne);
  }

  /** Desactive l'affectation active d'une inscription. */
  public async desactiverAffectationActiveParInscription(idInscriptionScolaire: UUID, modifiePar: UUID): Promise<void> {
    await this.executerCommande(
      'UPDATE affectations SET active = false, modifie_par = $2, modifie_le = NOW(), version = version + 1 WHERE id_inscription_scolaire = $1 AND active = true',
      [idInscriptionScolaire, modifiePar],
    );
  }
}
