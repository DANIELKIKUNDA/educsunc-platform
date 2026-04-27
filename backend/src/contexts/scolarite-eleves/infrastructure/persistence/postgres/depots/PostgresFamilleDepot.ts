import { Famille } from '../../../../domain/aggregates/Famille';
import { DepotFamille } from '../../../../domain/repositories/DepotFamille';
import { UUID } from '../../../../domain/value-objects/TypesPrimitifs';
import { FamillePersistenceMapper, FamilleRow } from '../mappers/FamillePersistenceMapper';
import { BaseDepotPostgresScolariteEleves } from './BaseDepotPostgresScolariteEleves';

// Ce fichier implemente le depot PostgreSQL des familles.
export class PostgresFamilleDepot extends BaseDepotPostgresScolariteEleves implements DepotFamille {
  /** Sauvegarde une famille par upsert technique. */
  public async sauvegarder(famille: Famille): Promise<void> {
    const ligne = FamillePersistenceMapper.versLigne(famille);
    this.verifierEcritureTenant(ligne.id_organisation, ligne.id_ecole);
    await this.executerCommande(
      `INSERT INTO familles (
        id, id_organisation, id_ecole, code_famille, nom_famille, adresse, telephone_principal,
        email, responsables, cree_par, cree_le, modifie_par, modifie_le, version, supprime_logiquement
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12,$13,$14,$15)
      ON CONFLICT (id) DO UPDATE SET
        code_famille = EXCLUDED.code_famille, nom_famille = EXCLUDED.nom_famille,
        adresse = EXCLUDED.adresse, telephone_principal = EXCLUDED.telephone_principal,
        email = EXCLUDED.email, responsables = EXCLUDED.responsables,
        modifie_par = EXCLUDED.modifie_par, modifie_le = EXCLUDED.modifie_le,
        version = EXCLUDED.version, supprime_logiquement = EXCLUDED.supprime_logiquement`,
      [
        ligne.id, ligne.id_organisation, ligne.id_ecole, ligne.code_famille, ligne.nom_famille,
        ligne.adresse, ligne.telephone_principal, ligne.email, JSON.stringify(ligne.responsables),
        ligne.cree_par, ligne.cree_le, ligne.modifie_par, ligne.modifie_le, ligne.version, ligne.supprime_logiquement,
      ],
    );
  }

  /** Recherche une famille par identifiant. */
  public async trouverParId(idFamille: UUID): Promise<Famille | null> {
    const ligne = await this.executerRequeteUnique<FamilleRow>('SELECT * FROM familles WHERE id = $1 LIMIT 1', [idFamille]);
    return ligne === null ? null : FamillePersistenceMapper.depuisLigne(ligne);
  }

  /** Recherche une famille par code dans une ecole. */
  public async trouverParCode(idEcole: UUID, codeFamille: string): Promise<Famille | null> {
    const ligne = await this.executerRequeteUnique<FamilleRow>('SELECT * FROM familles WHERE id_ecole = $1 AND code_famille = $2 LIMIT 1', [idEcole, codeFamille]);
    return ligne === null ? null : FamillePersistenceMapper.depuisLigne(ligne);
  }

  /** Liste les familles d'une ecole. */
  public async listerParEcole(idEcole: UUID): Promise<Famille[]> {
    const lignes = await this.executerRequete<FamilleRow>('SELECT * FROM familles WHERE id_ecole = $1 ORDER BY nom_famille ASC', [idEcole]);
    return lignes.map(FamillePersistenceMapper.depuisLigne);
  }

  /** Liste les familles d'une organisation. */
  public async listerParOrganisation(idOrganisation: UUID): Promise<Famille[]> {
    const lignes = await this.executerRequete<FamilleRow>('SELECT * FROM familles WHERE id_organisation = $1 ORDER BY nom_famille ASC', [idOrganisation]);
    return lignes.map(FamillePersistenceMapper.depuisLigne);
  }

  /** Indique si un code famille existe deja dans l'ecole. */
  public async existeCodeFamilleDansEcole(idEcole: UUID, codeFamille: string, idFamilleIgnore?: UUID): Promise<boolean> {
    const ligne = await this.executerRequeteUnique<{ existe: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM familles WHERE id_ecole = $1 AND code_famille = $2 AND ($3::uuid IS NULL OR id <> $3::uuid)) AS existe',
      [idEcole, codeFamille, idFamilleIgnore ?? null],
    );
    return ligne?.existe ?? false;
  }

  /** Compte les eleves actifs de la famille. */
  public async compterElevesActifsDeFamille(idFamille: UUID): Promise<number> {
    const ligne = await this.executerRequeteUnique<{ total: number | string }>(
      "SELECT COUNT(*) AS total FROM eleves WHERE id_famille = $1 AND statut_global = 'ACTIF' AND supprime_logiquement = false",
      [idFamille],
    );
    return Number(ligne?.total ?? 0);
  }
}
