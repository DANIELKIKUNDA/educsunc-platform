import { InscriptionScolaire } from '../../../../domain/aggregates/InscriptionScolaire';
import { DepotInscriptionScolaire } from '../../../../domain/repositories/DepotInscriptionScolaire';
import { UUID } from '../../../../domain/value-objects/TypesPrimitifs';
import { InscriptionPersistenceMapper, InscriptionRow } from '../mappers/InscriptionPersistenceMapper';
import { BaseDepotPostgresScolariteEleves } from './BaseDepotPostgresScolariteEleves';

// Ce fichier implemente le depot PostgreSQL des inscriptions scolaires.
export class PostgresInscriptionDepot extends BaseDepotPostgresScolariteEleves implements DepotInscriptionScolaire {
  /** Sauvegarde une inscription par upsert technique. */
  public async sauvegarder(inscription: InscriptionScolaire): Promise<void> {
    const ligne = InscriptionPersistenceMapper.versLigne(inscription);
    this.verifierEcritureTenant(ligne.id_organisation, ligne.id_ecole);
    await this.executerCommande(
      `INSERT INTO inscriptions (
        id, id_organisation, id_ecole, id_eleve, id_annee_scolaire, date_inscription,
        origine_inscription, statut_inscription, numero_ordre, observation, cree_par,
        cree_le, modifie_par, modifie_le, version, supprime_logiquement
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      ON CONFLICT (id) DO UPDATE SET
        statut_inscription = EXCLUDED.statut_inscription, numero_ordre = EXCLUDED.numero_ordre,
        observation = EXCLUDED.observation, modifie_par = EXCLUDED.modifie_par,
        modifie_le = EXCLUDED.modifie_le, version = EXCLUDED.version,
        supprime_logiquement = EXCLUDED.supprime_logiquement`,
      [
        ligne.id, ligne.id_organisation, ligne.id_ecole, ligne.id_eleve, ligne.id_annee_scolaire,
        ligne.date_inscription, ligne.origine_inscription, ligne.statut_inscription, ligne.numero_ordre,
        ligne.observation, ligne.cree_par, ligne.cree_le, ligne.modifie_par, ligne.modifie_le,
        ligne.version, ligne.supprime_logiquement,
      ],
    );
  }

  /** Recherche une inscription par identifiant. */
  public async trouverParId(idInscriptionScolaire: UUID): Promise<InscriptionScolaire | null> {
    const ligne = await this.executerRequeteUnique<InscriptionRow>('SELECT * FROM inscriptions WHERE id = $1 LIMIT 1', [idInscriptionScolaire]);
    return ligne === null ? null : InscriptionPersistenceMapper.depuisLigne(ligne);
  }

  /** Recherche l'inscription active d'un eleve pour une annee. */
  public async trouverInscriptionActiveParEleveEtAnnee(idEleve: UUID, idAnneeScolaire: UUID): Promise<InscriptionScolaire | null> {
    const ligne = await this.executerRequeteUnique<InscriptionRow>(
      "SELECT * FROM inscriptions WHERE id_eleve = $1 AND id_annee_scolaire = $2 AND statut_inscription = 'VALIDEE' LIMIT 1",
      [idEleve, idAnneeScolaire],
    );
    return ligne === null ? null : InscriptionPersistenceMapper.depuisLigne(ligne);
  }

  /** Recherche la derniere inscription active connue d'un eleve. */
  public async trouverDerniereInscriptionActiveParEleve(idEleve: UUID): Promise<InscriptionScolaire | null> {
    const ligne = await this.executerRequeteUnique<InscriptionRow>(
      `SELECT * FROM inscriptions
       WHERE id_eleve = $1 AND statut_inscription = 'VALIDEE'
       ORDER BY date_inscription DESC, cree_le DESC
       LIMIT 1`,
      [idEleve],
    );
    return ligne === null ? null : InscriptionPersistenceMapper.depuisLigne(ligne);
  }

  /** Liste les inscriptions d'une annee. */
  public async listerParAnnee(idAnneeScolaire: UUID): Promise<InscriptionScolaire[]> {
    const lignes = await this.executerRequete<InscriptionRow>('SELECT * FROM inscriptions WHERE id_annee_scolaire = $1 ORDER BY date_inscription DESC', [idAnneeScolaire]);
    return lignes.map(InscriptionPersistenceMapper.depuisLigne);
  }

  /** Liste les inscriptions dont les affectations sont dans une classe. */
  public async listerParClasse(idClassePedagogique: UUID): Promise<InscriptionScolaire[]> {
    const lignes = await this.executerRequete<InscriptionRow>(
      `SELECT i.* FROM inscriptions i
       INNER JOIN affectations a ON a.id_inscription_scolaire = i.id
       WHERE a.id_classe_pedagogique = $1 AND a.active = true
       ORDER BY i.date_inscription DESC`,
      [idClassePedagogique],
    );
    return lignes.map(InscriptionPersistenceMapper.depuisLigne);
  }

  /** Liste les inscriptions d'une ecole et d'une annee. */
  public async listerParEcoleEtAnnee(idEcole: UUID, idAnneeScolaire: UUID): Promise<InscriptionScolaire[]> {
    const lignes = await this.executerRequete<InscriptionRow>('SELECT * FROM inscriptions WHERE id_ecole = $1 AND id_annee_scolaire = $2 ORDER BY date_inscription DESC', [idEcole, idAnneeScolaire]);
    return lignes.map(InscriptionPersistenceMapper.depuisLigne);
  }

  /** Liste les inscriptions d'une organisation et d'une annee. */
  public async listerParOrganisationEtAnnee(idOrganisation: UUID, idAnneeScolaire: UUID): Promise<InscriptionScolaire[]> {
    const lignes = await this.executerRequete<InscriptionRow>('SELECT * FROM inscriptions WHERE id_organisation = $1 AND id_annee_scolaire = $2 ORDER BY date_inscription DESC', [idOrganisation, idAnneeScolaire]);
    return lignes.map(InscriptionPersistenceMapper.depuisLigne);
  }

  /** Indique si une inscription active existe deja. */
  public async existeInscriptionActiveParEleveEtAnnee(idEleve: UUID, idAnneeScolaire: UUID): Promise<boolean> {
    const ligne = await this.executerRequeteUnique<{ existe: boolean }>(
      "SELECT EXISTS(SELECT 1 FROM inscriptions WHERE id_eleve = $1 AND id_annee_scolaire = $2 AND statut_inscription = 'VALIDEE') AS existe",
      [idEleve, idAnneeScolaire],
    );
    return ligne?.existe ?? false;
  }
}
