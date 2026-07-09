import { Pagination, ResultatPagine } from '../../../../../../shared/application/Pagination';
import { MigrationReferentielProgramme } from '../../../../domain/aggregates/MigrationReferentielProgramme';
import { DepotMigrationReferentielProgramme as ContratDepotMigrationReferentielProgramme } from '../../../../domain/repositories/DepotMigrationReferentielProgramme';
import { MigrationReferentielProgrammeId } from '../../../../domain/value-objects/MigrationReferentielProgrammeId';
import { ProgrammeNiveauId } from '../../../../domain/value-objects/ProgrammeNiveauId';
import { StatutMigrationReferentiel } from '../../../../domain/value-objects/StatutMigrationReferentiel';
import { VersionReferentielProgrammeId } from '../../../../domain/value-objects/VersionReferentielProgrammeId';
import {
  MapperMigrationReferentielProgrammePostgres,
  PersistanceLigneDiffMigrationPostgres,
  PersistanceMigrationReferentielProgrammePostgres,
  PersistanceTransformationNotePostgres,
} from '../mappers/MappersExploitationLocalePostgres';
import { ContexteExecutionTenantReferentielAcademique } from '../../../tenancy/ContexteExecutionTenantReferentielAcademique';
import { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import { BaseDepotPostgresReferentielAcademique } from './BaseDepotPostgresReferentielAcademique';
import { ClientPostgresReferentielAcademique } from './ClientPostgresReferentielAcademique';

// Ce depot implemente la persistance PostgreSQL des migrations de referentiel historisees.
export class DepotMigrationReferentielProgrammePostgres
  extends BaseDepotPostgresReferentielAcademique
  implements ContratDepotMigrationReferentielProgramme
{
  // Ce constructeur injecte le client PostgreSQL et l'unite de travail optionnelle.
  constructor(
    clientLecture: ClientPostgresReferentielAcademique,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresReferentielAcademique>,
    contexteExecutionTenant?: ContexteExecutionTenantReferentielAcademique,
  ) {
    super(clientLecture, uniteDeTravail, contexteExecutionTenant);
  }

  // Cette methode recherche une migration de referentiel par son identifiant metier.
  public async trouverParId(
    idMigrationReferentielProgramme: MigrationReferentielProgrammeId,
  ): Promise<MigrationReferentielProgramme | null> {
    const clauseIsolation = this.construireClauseIsolationLectureParEcole(
      [
        '(',
        'SELECT "programme_niveau"."id_ecole"',
        'FROM "programmes_niveau" "programme_niveau"',
        'WHERE "programme_niveau"."id" = "migrations_referentiel_programme"."id_programme_niveau"',
        'LIMIT 1',
        ')',
      ].join(' '),
      2,
    );
    const parent = await this.executerRequeteUnique<PersistanceMigrationReferentielProgrammePostgres>(
      `SELECT * FROM migrations_referentiel_programme WHERE id = $1 ${clauseIsolation.clauseSql} LIMIT 1`,
      [idMigrationReferentielProgramme.obtenirValeur(), ...clauseIsolation.parametres],
    );

    if (parent === null) {
      return null;
    }

    const [lignesDiff, transformationsNotes] = await Promise.all([
      this.chargerLignesDiff(parent.id),
      this.chargerTransformationsNotes(parent.id),
    ]);

    return this.marquerAgregatCharge(
      MapperMigrationReferentielProgrammePostgres.depuisPersistance(
        parent,
        lignesDiff,
        transformationsNotes,
      ),
    );
  }

  // Cette methode liste les migrations rattachees a un programme niveau.
  public async listerParProgrammeNiveau(
    idProgrammeNiveau: ProgrammeNiveauId,
    pagination: Pagination,
  ): Promise<ResultatPagine<MigrationReferentielProgramme>> {
    const idProgrammeValeur = idProgrammeNiveau.obtenirValeur();
    const clauseIsolation = this.construireClauseIsolationLectureParEcole(
      [
        '(',
        'SELECT programme_niveau.id_ecole',
        'FROM programmes_niveau programme_niveau',
        'WHERE programme_niveau.id = migrations_referentiel_programme.id_programme_niveau',
        'LIMIT 1',
        ')',
      ].join(' '),
      2,
    );

    return this.executerLecturePaginee<
      PersistanceMigrationReferentielProgrammePostgres,
      MigrationReferentielProgramme
    >(
      [
        'SELECT COUNT(*) AS total FROM migrations_referentiel_programme',
        'WHERE id_programme_niveau = $1',
        clauseIsolation.clauseSql,
      ].join(' '),
      [idProgrammeValeur, ...clauseIsolation.parametres],
      [
        'SELECT * FROM migrations_referentiel_programme',
        'WHERE id_programme_niveau = $1',
        clauseIsolation.clauseSql,
        'ORDER BY date_migration DESC, id ASC',
      ].join(' '),
      [idProgrammeValeur, ...clauseIsolation.parametres],
      pagination,
      async (ligne) => {
        const [lignesDiff, transformationsNotes] = await Promise.all([
          this.chargerLignesDiff(ligne.id),
          this.chargerTransformationsNotes(ligne.id),
        ]);

        return this.marquerAgregatCharge(
          MapperMigrationReferentielProgrammePostgres.depuisPersistance(
            ligne,
            lignesDiff,
            transformationsNotes,
          ),
        );
      },
    );
  }

  // Cette methode detecte si une version officielle est deja engagee dans une migration non annulee.
  public async estVersionEngagee(
    idVersionReferentielProgramme: VersionReferentielProgrammeId,
  ): Promise<boolean> {
    const clauseIsolation = this.construireClauseIsolationLectureParEcole(
      'programme_niveau.id_ecole',
      3,
    );
    const ligne = await this.executerRequeteUnique<{ present: number }>(
      [
        'SELECT 1 AS present',
        'FROM migrations_referentiel_programme',
        'INNER JOIN programmes_niveau programme_niveau',
        'ON programme_niveau.id = migrations_referentiel_programme.id_programme_niveau',
        'WHERE (ancienne_version_referentiel = $1 OR nouvelle_version_referentiel = $1)',
        'AND statut <> $2',
        clauseIsolation.clauseSql,
        'LIMIT 1',
      ].join(' '),
      [
        idVersionReferentielProgramme.obtenirValeur(),
        StatutMigrationReferentiel.ANNULEE,
        ...clauseIsolation.parametres,
      ],
    );

    return ligne !== null;
  }

  // Cette methode persiste l'etat courant d'une migration de referentiel.
  public async sauvegarder(
    migrationReferentielProgramme: MigrationReferentielProgramme,
  ): Promise<void> {
    const parent = MapperMigrationReferentielProgrammePostgres.versPersistance(
      migrationReferentielProgramme,
    );
    const lignesDiff = MapperMigrationReferentielProgrammePostgres.versLignesDiffPersistance(
      migrationReferentielProgramme,
    );
    const transformationsNotes =
      MapperMigrationReferentielProgrammePostgres.versTransformationsNotesPersistance(
        migrationReferentielProgramme,
      );
    const colonnesParent = [
      'id',
      'id_programme_niveau',
      'ancienne_version_referentiel',
      'nouvelle_version_referentiel',
      'date_migration',
      'declenche_par',
      'statut',
      'resume_diff',
      'version',
    ] as const;
    const colonnesDiff = [
      'id_migration_referentiel_programme',
      'type_diff',
      'code_cours',
      'ancienne_ponderation',
      'nouvelle_ponderation',
      'ancien_ordre',
      'nouvel_ordre',
      'commentaire',
    ] as const;
    const colonnesTransformation = [
      'id_migration_referentiel_programme',
      'id_note',
      'ancienne_valeur',
      'nouvelle_valeur',
      'ancien_maximum',
      'nouveau_maximum',
      'regle_appliquee',
      'date_transformation',
    ] as const;

    const idEcoleProgrammeNiveau = await this.resoudreEcoleProgrammeNiveau(parent.id_programme_niveau);

    this.verifierEcritureLocaleAutorisee(idEcoleProgrammeNiveau);

    await this.sauvegarderAgregatVersionne(
      migrationReferentielProgramme,
      'migrations_referentiel_programme',
      'id',
      migrationReferentielProgramme.obtenirId().obtenirValeur(),
      colonnesParent,
      this.extraireValeurs(parent, colonnesParent),
    );

    await this.remplacerCollectionEnfants(
      'lignes_diff_migration',
      'id_migration_referentiel_programme',
      parent.id,
      colonnesDiff,
      lignesDiff,
      (ligneDiff) => this.extraireValeurs(ligneDiff, colonnesDiff),
    );

    await this.remplacerCollectionEnfants(
      'transformations_note',
      'id_migration_referentiel_programme',
      parent.id,
      colonnesTransformation,
      transformationsNotes,
      (transformation) => this.extraireValeurs(transformation, colonnesTransformation),
    );
  }

  private async chargerLignesDiff(
    idMigrationReferentielProgramme: string,
  ): Promise<readonly PersistanceLigneDiffMigrationPostgres[]> {
    return this.executerRequete<PersistanceLigneDiffMigrationPostgres>(
      [
        'SELECT * FROM lignes_diff_migration',
        'WHERE id_migration_referentiel_programme = $1',
        'ORDER BY type_diff ASC, code_cours ASC',
      ].join(' '),
      [idMigrationReferentielProgramme],
    );
  }

  private async chargerTransformationsNotes(
    idMigrationReferentielProgramme: string,
  ): Promise<readonly PersistanceTransformationNotePostgres[]> {
    return this.executerRequete<PersistanceTransformationNotePostgres>(
      [
        'SELECT * FROM transformations_note',
        'WHERE id_migration_referentiel_programme = $1',
        'ORDER BY date_transformation ASC, id_note ASC',
      ].join(' '),
      [idMigrationReferentielProgramme],
    );
  }

  private async resoudreEcoleProgrammeNiveau(idProgrammeNiveau: string): Promise<string> {
    const ligne = await this.executerRequeteUnique<{ id_ecole: string }>(
      'SELECT id_ecole FROM programmes_niveau WHERE id = $1 LIMIT 1',
      [idProgrammeNiveau],
    );

    if (ligne === null || ligne.id_ecole.trim().length === 0) {
      throw new Error(
        "Impossible de determiner l'ecole rattachee au programme niveau parent d'une migration.",
      );
    }

    return ligne.id_ecole;
  }
}
