import { Eleve } from '../../../../domain/aggregates/Eleve';
import { CritereRechercheIdentiteEleve, DepotEleve } from '../../../../domain/repositories/DepotEleve';
import { UUID } from '../../../../domain/value-objects/TypesPrimitifs';
import { ElevePersistenceMapper, EleveRow } from '../mappers/ElevePersistenceMapper';
import { BaseDepotPostgresScolariteEleves } from './BaseDepotPostgresScolariteEleves';

// Ce fichier implemente le depot PostgreSQL des eleves.
/**
 * Ce depot persiste et reconstruit l'agregat Eleve sans porter de logique metier.
 */
export class PostgresEleveDepot extends BaseDepotPostgresScolariteEleves implements DepotEleve {
  /** Sauvegarde un eleve par upsert technique. */
  public async sauvegarder(eleve: Eleve): Promise<void> {
    const ligne = ElevePersistenceMapper.versLigne(eleve);
    this.verifierEcritureTenant(ligne.id_organisation, ligne.id_ecole);
    await this.executerCommande(
      `INSERT INTO eleves (
        id, id_organisation, id_ecole, matricule, nom, post_nom, prenom, sexe, date_naissance,
        lieu_naissance, nationalite, ecole_provenance, id_famille, statut_global, cree_par,
        cree_le, modifie_par, modifie_le, version, supprime_logiquement
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,$15,$16,$17,$18,$19,$20)
      ON CONFLICT (id) DO UPDATE SET
        matricule = EXCLUDED.matricule, nom = EXCLUDED.nom, post_nom = EXCLUDED.post_nom,
        prenom = EXCLUDED.prenom, sexe = EXCLUDED.sexe, date_naissance = EXCLUDED.date_naissance,
        lieu_naissance = EXCLUDED.lieu_naissance, nationalite = EXCLUDED.nationalite,
        ecole_provenance = EXCLUDED.ecole_provenance, id_famille = EXCLUDED.id_famille,
        statut_global = EXCLUDED.statut_global, modifie_par = EXCLUDED.modifie_par,
        modifie_le = EXCLUDED.modifie_le, version = EXCLUDED.version,
        supprime_logiquement = EXCLUDED.supprime_logiquement`,
      [
        ligne.id, ligne.id_organisation, ligne.id_ecole, ligne.matricule, ligne.nom, ligne.post_nom,
        ligne.prenom, ligne.sexe, ligne.date_naissance, ligne.lieu_naissance, ligne.nationalite,
        JSON.stringify(ligne.ecole_provenance), ligne.id_famille, ligne.statut_global, ligne.cree_par,
        ligne.cree_le, ligne.modifie_par, ligne.modifie_le, ligne.version, ligne.supprime_logiquement,
      ],
    );
  }

  /** Recherche un eleve par identifiant. */
  public async trouverParId(idEleve: UUID): Promise<Eleve | null> {
    const ligne = await this.executerRequeteUnique<EleveRow>('SELECT * FROM eleves WHERE id = $1 LIMIT 1', [idEleve]);
    return ligne === null ? null : ElevePersistenceMapper.depuisLigne(ligne);
  }

  /** Recherche un eleve par matricule dans une ecole. */
  public async trouverParMatricule(idEcole: UUID, matricule: string): Promise<Eleve | null> {
    const ligne = await this.executerRequeteUnique<EleveRow>('SELECT * FROM eleves WHERE id_ecole = $1 AND matricule = $2 LIMIT 1', [idEcole, matricule]);
    return ligne === null ? null : ElevePersistenceMapper.depuisLigne(ligne);
  }

  /** Liste les eleves d'une ecole. */
  public async listerParEcole(idEcole: UUID): Promise<Eleve[]> {
    const lignes = await this.executerRequete<EleveRow>('SELECT * FROM eleves WHERE id_ecole = $1 ORDER BY nom ASC, post_nom ASC', [idEcole]);
    return lignes.map(ElevePersistenceMapper.depuisLigne);
  }

  /** Liste les eleves d'une organisation. */
  public async listerParOrganisation(idOrganisation: UUID): Promise<Eleve[]> {
    const lignes = await this.executerRequete<EleveRow>('SELECT * FROM eleves WHERE id_organisation = $1 ORDER BY nom ASC, post_nom ASC', [idOrganisation]);
    return lignes.map(ElevePersistenceMapper.depuisLigne);
  }

  /** Recherche des eleves par identite administrative. */
  public async rechercherParIdentite(critere: CritereRechercheIdentiteEleve): Promise<Eleve[]> {
    const lignes = await this.executerRequete<EleveRow>(
      `SELECT * FROM eleves
       WHERE id_ecole = $1
       AND ($2 = '' OR lower(nom) LIKE lower($2))
       AND ($3 = '' OR lower(post_nom) LIKE lower($3))
       AND ($4::text IS NULL OR lower(coalesce(prenom, '')) LIKE lower($4))
       AND ($5::text IS NULL OR date_naissance = $5)
       ORDER BY nom ASC, post_nom ASC`,
      [
        critere.idEcole,
        `%${critere.nom}%`,
        `%${critere.postNom}%`,
        critere.prenom === undefined ? null : `%${critere.prenom}%`,
        critere.dateNaissance ?? null,
      ],
    );
    return lignes.map(ElevePersistenceMapper.depuisLigne);
  }

  /** Indique si le matricule existe deja dans l'ecole. */
  public async existeMatriculeDansEcole(idEcole: UUID, matricule: string, idEleveIgnore?: UUID): Promise<boolean> {
    const ligne = await this.executerRequeteUnique<{ existe: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM eleves WHERE id_ecole = $1 AND matricule = $2 AND ($3::uuid IS NULL OR id <> $3::uuid)) AS existe',
      [idEcole, matricule, idEleveIgnore ?? null],
    );
    return ligne?.existe ?? false;
  }

  /** Indique si un doublon probable existe. */
  public async existeDoublonProbable(critere: CritereRechercheIdentiteEleve, idEleveIgnore?: UUID): Promise<boolean> {
    const ligne = await this.executerRequeteUnique<{ existe: boolean }>(
      `SELECT EXISTS(
        SELECT 1 FROM eleves
        WHERE id_ecole = $1 AND lower(nom) = lower($2) AND lower(post_nom) = lower($3)
        AND ($4::text IS NULL OR lower(coalesce(prenom, '')) = lower($4))
        AND ($5::text IS NULL OR date_naissance = $5)
        AND ($6::uuid IS NULL OR id <> $6::uuid)
      ) AS existe`,
      [critere.idEcole, critere.nom, critere.postNom, critere.prenom ?? null, critere.dateNaissance ?? null, idEleveIgnore ?? null],
    );
    return ligne?.existe ?? false;
  }

  /** Liste les eleves rattaches a une famille. */
  public async trouverParFamille(idFamille: UUID): Promise<Eleve[]> {
    const lignes = await this.executerRequete<EleveRow>('SELECT * FROM eleves WHERE id_famille = $1 ORDER BY nom ASC', [idFamille]);
    return lignes.map(ElevePersistenceMapper.depuisLigne);
  }
}
