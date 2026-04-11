import { Pagination, ResultatPagine } from '../../../../../../shared/application/Pagination';
import { InfrastructureError } from '../../../../../../shared/exceptions/InfrastructureError';
import { VersionReferentielProgramme } from '../../../../domain/aggregates/VersionReferentielProgramme';
import { DepotVersionReferentielProgramme as ContratDepotVersionReferentielProgramme } from '../../../../domain/repositories/DepotVersionReferentielProgramme';
import { VersionReferentielProgrammeId } from '../../../../domain/value-objects/VersionReferentielProgrammeId';
import {
  MapperVersionReferentielProgrammePostgres,
  PersistanceVersionReferentielProgrammePostgres,
} from '../mappers/MappersReferentielsPostgres';
import { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import { BaseDepotPostgresReferentielAcademique } from './BaseDepotPostgresReferentielAcademique';
import { ClientPostgresReferentielAcademique } from './ClientPostgresReferentielAcademique';

// Ce contrat permet de resoudre le referentiel programme parent d'une version officielle.
export interface ResolveurReferentielProgrammePourVersionPostgres {
  // Cette methode retourne l'identifiant du referentiel programme parent d'une version.
  resoudreIdReferentielProgramme(
    versionReferentielProgramme: VersionReferentielProgramme,
    clientPostgres: ClientPostgresReferentielAcademique,
  ): Promise<string>;
}

// Ce depot implemente la persistance PostgreSQL des versions officielles de referentiel.
export class DepotVersionReferentielProgrammePostgres
  extends BaseDepotPostgresReferentielAcademique
  implements ContratDepotVersionReferentielProgramme
{
  private readonly resolveurReferentielProgramme?: ResolveurReferentielProgrammePourVersionPostgres;

  // Ce constructeur injecte le client PostgreSQL, l'unite de travail et le resolveur parent si necessaire.
  constructor(
    clientLecture: ClientPostgresReferentielAcademique,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresReferentielAcademique>,
    resolveurReferentielProgramme?: ResolveurReferentielProgrammePourVersionPostgres,
  ) {
    super(clientLecture, uniteDeTravail);
    this.resolveurReferentielProgramme = resolveurReferentielProgramme;
  }

  // Cette methode recherche une version officielle par son identifiant metier.
  public async trouverParId(
    idVersionReferentielProgramme: VersionReferentielProgrammeId,
  ): Promise<VersionReferentielProgramme | null> {
    const ligne = await this.executerRequeteUnique<PersistanceVersionReferentielProgrammePostgres>(
      'SELECT * FROM versions_referentiel_programme WHERE id = $1 LIMIT 1',
      [idVersionReferentielProgramme.obtenirValeur()],
    );

    return ligne === null ? null : MapperVersionReferentielProgrammePostgres.depuisPersistance(ligne);
  }

  // Cette methode recherche une version officielle par son code de version.
  public async trouverParCodeVersion(
    codeVersion: string,
  ): Promise<VersionReferentielProgramme | null> {
    const ligne = await this.executerRequeteUnique<PersistanceVersionReferentielProgrammePostgres>(
      'SELECT * FROM versions_referentiel_programme WHERE code_version = $1 LIMIT 1',
      [codeVersion],
    );

    return ligne === null ? null : MapperVersionReferentielProgrammePostgres.depuisPersistance(ligne);
  }

  // Cette methode retrouve la version active pour les nouvelles operations si elle existe.
  public async trouverVersionActive(): Promise<VersionReferentielProgramme | null> {
    const ligne = await this.executerRequeteUnique<PersistanceVersionReferentielProgrammePostgres>(
      "SELECT * FROM versions_referentiel_programme WHERE active = true ORDER BY cree_le DESC LIMIT 1",
    );

    return ligne === null ? null : MapperVersionReferentielProgrammePostgres.depuisPersistance(ligne);
  }

  // Cette methode liste les versions par annee de reference avec pagination.
  public async listerParAnneeReference(
    anneeReference: string,
    pagination: Pagination,
  ): Promise<ResultatPagine<VersionReferentielProgramme>> {
    return this.executerLecturePaginee<
      PersistanceVersionReferentielProgrammePostgres,
      VersionReferentielProgramme
    >(
      'SELECT COUNT(*) AS total FROM versions_referentiel_programme WHERE annee_reference = $1',
      [anneeReference],
      [
        'SELECT * FROM versions_referentiel_programme',
        'WHERE annee_reference = $1',
        'ORDER BY date_publication DESC, code_version DESC',
      ].join(' '),
      [anneeReference],
      pagination,
      (ligne) => MapperVersionReferentielProgrammePostgres.depuisPersistance(ligne),
    );
  }

  // Cette methode persiste l'etat courant d'une version de referentiel.
  public async sauvegarder(
    versionReferentielProgramme: VersionReferentielProgramme,
  ): Promise<void> {
    const idReferentielProgramme = await this.resoudreIdReferentielProgramme(
      versionReferentielProgramme,
    );
    const enregistrement = MapperVersionReferentielProgrammePostgres.versPersistance(
      versionReferentielProgramme,
      idReferentielProgramme,
    );
    const colonnes = [
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

    await this.executerCommande(
      this.construireInstructionUpsert('versions_referentiel_programme', colonnes, ['id']),
      this.extraireValeurs(enregistrement, colonnes),
    );
  }

  private async resoudreIdReferentielProgramme(
    versionReferentielProgramme: VersionReferentielProgramme,
  ): Promise<string> {
    const ligneExistante = await this.executerRequeteUnique<PersistanceVersionReferentielProgrammePostgres>(
      'SELECT * FROM versions_referentiel_programme WHERE id = $1 LIMIT 1',
      [versionReferentielProgramme.obtenirId().obtenirValeur()],
    );

    if (ligneExistante !== null) {
      return ligneExistante.id_referentiel_programme;
    }

    if (this.resolveurReferentielProgramme === undefined) {
      throw new InfrastructureError(
        "Impossible de persister une version de referentiel sans connaitre son referentiel programme parent.",
        'DEPOT_VERSION_REFERENTIEL_PARENT_ABSENT',
        {
          idVersionReferentielProgramme: versionReferentielProgramme.obtenirId().obtenirValeur(),
          codeVersion: versionReferentielProgramme.obtenirCodeVersion(),
        },
      );
    }

    const idReferentielProgramme =
      await this.resolveurReferentielProgramme.resoudreIdReferentielProgramme(
        versionReferentielProgramme,
        this.obtenirClientActif(),
      );

    if (idReferentielProgramme.trim().length === 0) {
      throw new InfrastructureError(
        "Le resolveur de referentiel programme a retourne un identifiant parent vide.",
        'DEPOT_VERSION_REFERENTIEL_PARENT_INVALIDE',
        {
          idVersionReferentielProgramme: versionReferentielProgramme.obtenirId().obtenirValeur(),
        },
      );
    }

    return idReferentielProgramme;
  }
}
