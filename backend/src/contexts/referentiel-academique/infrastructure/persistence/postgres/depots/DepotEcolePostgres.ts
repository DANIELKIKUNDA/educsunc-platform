import { Pagination, ResultatPagine } from '../../../../../../shared/application/Pagination';
import { Ecole } from '../../../../domain/aggregates/Ecole';
import { DepotEcole as ContratDepotEcole } from '../../../../domain/repositories/DepotEcole';
import { EcoleId } from '../../../../domain/value-objects/EcoleId';
import { OrganisationId } from '../../../../domain/value-objects/OrganisationId';
import {
  MapperEcolePostgres,
  PersistanceEcolePostgres,
} from '../mappers/MappersStructuresGlobalesPostgres';
import { ContexteExecutionTenantReferentielAcademique } from '../../../tenancy/ContexteExecutionTenantReferentielAcademique';
import { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import { BaseDepotPostgresReferentielAcademique } from './BaseDepotPostgresReferentielAcademique';
import { ClientPostgresReferentielAcademique } from './ClientPostgresReferentielAcademique';

// Ce depot implemente la persistance PostgreSQL des ecoles globales.
export class DepotEcolePostgres
  extends BaseDepotPostgresReferentielAcademique
  implements ContratDepotEcole
{
  // Ce constructeur injecte le client PostgreSQL et l'unite de travail optionnelle.
  constructor(
    clientLecture: ClientPostgresReferentielAcademique,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresReferentielAcademique>,
    contexteExecutionTenant?: ContexteExecutionTenantReferentielAcademique,
  ) {
    super(clientLecture, uniteDeTravail, contexteExecutionTenant);
  }

  // Cette methode recherche une ecole par son identifiant metier.
  public async trouverParId(idEcole: EcoleId): Promise<Ecole | null> {
    const clauseIsolation = this.obtenirContexteExecutionTenant() === undefined
      ? { clauseSql: '', parametres: [] as readonly unknown[] }
      : this.construireClauseIsolationLectureParEcole('"id"', 2);
    const ligne = await this.executerRequeteUnique<PersistanceEcolePostgres>(
      `SELECT * FROM ecoles WHERE id = $1 ${clauseIsolation.clauseSql} LIMIT 1`,
      [idEcole.obtenirValeur(), ...clauseIsolation.parametres],
    );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(MapperEcolePostgres.depuisPersistance(ligne));
  }

  // Cette methode recherche une ecole par son code fonctionnel.
  public async trouverParCode(code: string): Promise<Ecole | null> {
    const ligne = await this.executerRequeteUnique<PersistanceEcolePostgres>(
      'SELECT * FROM ecoles WHERE code = $1 LIMIT 1',
      [code],
    );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(MapperEcolePostgres.depuisPersistance(ligne));
  }

  // Cette methode liste les ecoles d'une organisation avec pagination.
  public async listerParOrganisation(
    idOrganisation: OrganisationId,
    pagination: Pagination,
  ): Promise<ResultatPagine<Ecole>> {
    const idOrganisationValeur = idOrganisation.obtenirValeur();

    return this.executerLecturePaginee<PersistanceEcolePostgres, Ecole>(
      'SELECT COUNT(*) AS total FROM ecoles WHERE id_organisation = $1',
      [idOrganisationValeur],
      'SELECT * FROM ecoles WHERE id_organisation = $1 ORDER BY nom ASC, code ASC',
      [idOrganisationValeur],
      pagination,
      (ligne) => this.marquerAgregatCharge(MapperEcolePostgres.depuisPersistance(ligne)),
    );
  }

  // Cette methode retourne une lecture paginee de l'ensemble des ecoles.
  public async lister(pagination: Pagination): Promise<ResultatPagine<Ecole>> {
    return this.executerLecturePaginee<PersistanceEcolePostgres, Ecole>(
      'SELECT COUNT(*) AS total FROM ecoles',
      [],
      'SELECT * FROM ecoles ORDER BY nom ASC, code ASC',
      [],
      pagination,
      (ligne) => this.marquerAgregatCharge(MapperEcolePostgres.depuisPersistance(ligne)),
    );
  }

  // Cette methode persiste l'etat courant d'une ecole.
  public async sauvegarder(ecole: Ecole): Promise<void> {
    const enregistrement = MapperEcolePostgres.versPersistance(ecole);
    const colonnes = [
      'id',
      'id_organisation',
      'code',
      'nom',
      'sigle',
      'mode_exploitation',
      'actif',
      'adresse',
      'telephone',
      'email',
      'province_educationnelle',
      'ville',
      'commune_ou_territoire',
      'cree_le',
      'cree_par',
      'modifie_le',
      'modifie_par',
      'version',
    ] as const;

    await this.sauvegarderAgregatVersionne(
      ecole,
      'ecoles',
      'id',
      ecole.obtenirId().obtenirValeur(),
      colonnes,
      this.extraireValeurs(enregistrement, colonnes),
    );
  }
}
