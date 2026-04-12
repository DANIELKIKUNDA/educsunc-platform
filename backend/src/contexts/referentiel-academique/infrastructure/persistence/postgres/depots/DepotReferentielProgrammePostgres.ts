import { Pagination, ResultatPagine } from '../../../../../../shared/application/Pagination';
import { ReferentielProgramme } from '../../../../domain/aggregates/ReferentielProgramme';
import { DepotReferentielProgramme as ContratDepotReferentielProgramme } from '../../../../domain/repositories/DepotReferentielProgramme';
import { ClasseAcademiqueId } from '../../../../domain/value-objects/ClasseAcademiqueId';
import { ReferentielProgrammeId } from '../../../../domain/value-objects/ReferentielProgrammeId';
import { VersionReferentielProgrammeId } from '../../../../domain/value-objects/VersionReferentielProgrammeId';
import {
  MapperReferentielProgrammePostgres,
  MapperVersionReferentielProgrammePostgres,
  PersistanceLigneReferentielProgrammePostgres,
  PersistanceReferentielProgrammePostgres,
  PersistanceVersionReferentielProgrammePostgres,
} from '../mappers/MappersReferentielsPostgres';
import { ContexteExecutionTenantReferentielAcademique } from '../../../tenancy/ContexteExecutionTenantReferentielAcademique';
import { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import { BaseDepotPostgresReferentielAcademique } from './BaseDepotPostgresReferentielAcademique';
import { ClientPostgresReferentielAcademique } from './ClientPostgresReferentielAcademique';

// Ce depot implemente la persistance PostgreSQL du referentiel programme racine et de ses versions.
export class DepotReferentielProgrammePostgres
  extends BaseDepotPostgresReferentielAcademique
  implements ContratDepotReferentielProgramme
{
  // Ce constructeur injecte le client PostgreSQL et l'unite de travail optionnelle.
  constructor(
    clientLecture: ClientPostgresReferentielAcademique,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresReferentielAcademique>,
    contexteExecutionTenant?: ContexteExecutionTenantReferentielAcademique,
  ) {
    super(clientLecture, uniteDeTravail, contexteExecutionTenant);
  }

  // Cette methode recherche un referentiel programme par son identifiant metier.
  public async trouverParId(
    idReferentielProgramme: ReferentielProgrammeId,
  ): Promise<ReferentielProgramme | null> {
    const parent = await this.executerRequeteUnique<PersistanceReferentielProgrammePostgres>(
      'SELECT * FROM referentiels_programmes WHERE id = $1 LIMIT 1',
      [idReferentielProgramme.obtenirValeur()],
    );

    if (parent === null) {
      return null;
    }

    return this.reconstruireReferentielProgramme(parent);
  }

  // Cette methode recherche le referentiel principal d'une classe academique.
  public async trouverParClasseAcademique(
    idClasseAcademique: ClasseAcademiqueId,
  ): Promise<ReferentielProgramme | null> {
    const parent = await this.executerRequeteUnique<PersistanceReferentielProgrammePostgres>(
      [
        'SELECT * FROM referentiels_programmes',
        'WHERE id_classe_academique = $1',
        'ORDER BY actif DESC, cree_le ASC, id ASC',
        'LIMIT 1',
      ].join(' '),
      [idClasseAcademique.obtenirValeur()],
    );

    if (parent === null) {
      return null;
    }

    return this.reconstruireReferentielProgramme(parent);
  }

  // Cette methode recherche un referentiel a partir de l'identifiant d'une version enfant.
  public async trouverParIdVersion(
    idVersionReferentielProgramme: VersionReferentielProgrammeId,
  ): Promise<ReferentielProgramme | null> {
    const parent = await this.executerRequeteUnique<PersistanceReferentielProgrammePostgres>(
      [
        'SELECT parent.*',
        'FROM referentiels_programmes parent',
        'INNER JOIN versions_referentiel_programme version',
        'ON version.id_referentiel_programme = parent.id',
        'WHERE version.id = $1',
        'LIMIT 1',
      ].join(' '),
      [idVersionReferentielProgramme.obtenirValeur()],
    );

    if (parent === null) {
      return null;
    }

    return this.reconstruireReferentielProgramme(parent);
  }

  // Cette methode liste les referentiels programmes d'une classe academique.
  public async listerParClasseAcademique(
    idClasseAcademique: ClasseAcademiqueId,
    pagination: Pagination,
  ): Promise<ResultatPagine<ReferentielProgramme>> {
    const idClasseValeur = idClasseAcademique.obtenirValeur();

    return this.executerLecturePaginee<
      PersistanceReferentielProgrammePostgres,
      ReferentielProgramme
    >(
      'SELECT COUNT(*) AS total FROM referentiels_programmes WHERE id_classe_academique = $1',
      [idClasseValeur],
      [
        'SELECT * FROM referentiels_programmes',
        'WHERE id_classe_academique = $1',
        'ORDER BY cree_le ASC, id ASC',
      ].join(' '),
      [idClasseValeur],
      pagination,
      (ligne) => this.reconstruireReferentielProgramme(ligne),
    );
  }

  // Cette methode persiste le referentiel racine ainsi que ses versions et leurs lignes.
  public async sauvegarder(referentielProgramme: ReferentielProgramme): Promise<void> {
    const parent = MapperReferentielProgrammePostgres.versPersistance(referentielProgramme);
    const colonnesParent = [
      'id',
      'id_classe_academique',
      'type_structure_evaluation',
      'actif',
      'cree_le',
      'version',
    ] as const;

    await this.sauvegarderAgregatVersionne(
      referentielProgramme,
      'referentiels_programmes',
      'id',
      referentielProgramme.obtenirId().obtenirValeur(),
      colonnesParent,
      this.extraireValeurs(parent, colonnesParent),
    );

    const versionsReferentielProgramme = referentielProgramme.obtenirVersionsReferentielProgramme();
    const colonnesVersion = [
      'id',
      'id_referentiel_programme',
      'code_version',
      'annee_reference',
      'date_publication',
      'motif_publication',
      'active',
      'publiee',
      'source_import',
      'cree_le',
    ] as const;
    const colonnesLigne = [
      'id',
      'id_version_referentiel_programme',
      'id_referentiel_cours',
      'ordre_affichage',
      'obligatoire',
      'a_examen',
      'est_calculable',
      'source_ligne',
      'ponderation',
      'domaine',
      'sous_domaine',
    ] as const;

    for (const versionReferentielProgramme of versionsReferentielProgramme) {
      const versionPersistance = MapperVersionReferentielProgrammePostgres.versPersistance(
        versionReferentielProgramme,
        referentielProgramme.obtenirId().obtenirValeur(),
      );

      await this.executerCommande(
        this.construireInstructionUpsert(
          'versions_referentiel_programme',
          colonnesVersion,
          ['id'],
        ),
        this.extraireValeurs(versionPersistance, colonnesVersion),
      );

      const lignesPersistance = MapperReferentielProgrammePostgres.versLignesPersistance(
        versionReferentielProgramme,
      );

      await this.remplacerCollectionEnfants(
        'lignes_referentiel_programme',
        'id_version_referentiel_programme',
        versionReferentielProgramme.obtenirId().obtenirValeur(),
        colonnesLigne,
        lignesPersistance,
        (ligne) => this.extraireValeurs(ligne, colonnesLigne),
      );
    }
  }

  private async reconstruireReferentielProgramme(
    parent: PersistanceReferentielProgrammePostgres,
  ): Promise<ReferentielProgramme> {
    const { versions, lignesParVersion } = await this.chargerVersionsEtLignes(parent.id);

    const versionsDomaine = versions.map((version) =>
      MapperVersionReferentielProgrammePostgres.depuisPersistanceAvecLignes(
        version,
        lignesParVersion.get(version.id) ?? [],
      ));

    return this.marquerAgregatCharge(
      MapperReferentielProgrammePostgres.depuisPersistance(parent, versionsDomaine),
    );
  }

  private async chargerVersionsEtLignes(
    idReferentielProgramme: string,
  ): Promise<{
    versions: PersistanceVersionReferentielProgrammePostgres[];
    lignesParVersion: Map<string, PersistanceLigneReferentielProgrammePostgres[]>;
  }> {
    const versions = await this.executerRequete<PersistanceVersionReferentielProgrammePostgres>(
      [
        'SELECT * FROM versions_referentiel_programme',
        'WHERE id_referentiel_programme = $1',
        'ORDER BY date_publication DESC, cree_le DESC, id DESC',
      ].join(' '),
      [idReferentielProgramme],
    );

    if (versions.length === 0) {
      return {
        versions: [],
        lignesParVersion: new Map<string, PersistanceLigneReferentielProgrammePostgres[]>(),
      };
    }

    const idsVersions = versions.map((version) => version.id);
    const lignes = await this.executerRequete<PersistanceLigneReferentielProgrammePostgres>(
      [
        'SELECT * FROM lignes_referentiel_programme',
        'WHERE id_version_referentiel_programme = ANY($1)',
        'ORDER BY id_version_referentiel_programme ASC, ordre_affichage ASC, id ASC',
      ].join(' '),
      [idsVersions],
    );
    const lignesParVersion = new Map<string, PersistanceLigneReferentielProgrammePostgres[]>();

    for (const ligne of lignes) {
      const lignesVersion = lignesParVersion.get(ligne.id_version_referentiel_programme) ?? [];
      lignesVersion.push(ligne);
      lignesParVersion.set(ligne.id_version_referentiel_programme, lignesVersion);
    }

    return {
      versions: [...versions],
      lignesParVersion,
    };
  }
}
