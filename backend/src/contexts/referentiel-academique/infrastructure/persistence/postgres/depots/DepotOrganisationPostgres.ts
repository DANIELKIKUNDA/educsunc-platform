import { Pagination, ResultatPagine } from '../../../../../../shared/application/Pagination';
import { Organisation } from '../../../../domain/aggregates/Organisation';
import { DepotOrganisation as ContratDepotOrganisation } from '../../../../domain/repositories/DepotOrganisation';
import { OrganisationId } from '../../../../domain/value-objects/OrganisationId';
import {
  MapperOrganisationPostgres,
  PersistanceOrganisationPostgres,
} from '../mappers/MappersStructuresGlobalesPostgres';
import { ContexteExecutionTenantReferentielAcademique } from '../../../tenancy/ContexteExecutionTenantReferentielAcademique';
import { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import { BaseDepotPostgresReferentielAcademique } from './BaseDepotPostgresReferentielAcademique';
import { ClientPostgresReferentielAcademique } from './ClientPostgresReferentielAcademique';

// Ce depot implemente la persistance PostgreSQL des organisations du referentiel.
export class DepotOrganisationPostgres
  extends BaseDepotPostgresReferentielAcademique
  implements ContratDepotOrganisation
{
  // Ce constructeur injecte le client PostgreSQL et l'unite de travail optionnelle.
  constructor(
    clientLecture: ClientPostgresReferentielAcademique,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresReferentielAcademique>,
    contexteExecutionTenant?: ContexteExecutionTenantReferentielAcademique,
  ) {
    super(clientLecture, uniteDeTravail, contexteExecutionTenant);
  }

  // Cette methode recherche une organisation par son identifiant metier.
  public async trouverParId(idOrganisation: OrganisationId): Promise<Organisation | null> {
    const ligne = await this.executerRequeteUnique<PersistanceOrganisationPostgres>(
      'SELECT * FROM organisations WHERE id = $1 LIMIT 1',
      [idOrganisation.obtenirValeur()],
    );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(MapperOrganisationPostgres.depuisPersistance(ligne));
  }

  // Cette methode recherche une organisation par son code fonctionnel.
  public async trouverParCode(code: string): Promise<Organisation | null> {
    const ligne = await this.executerRequeteUnique<PersistanceOrganisationPostgres>(
      'SELECT * FROM organisations WHERE code = $1 LIMIT 1',
      [code],
    );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(MapperOrganisationPostgres.depuisPersistance(ligne));
  }

  // Cette methode recherche une organisation par son nom.
  public async trouverParNom(nom: string): Promise<Organisation | null> {
    const ligne = await this.executerRequeteUnique<PersistanceOrganisationPostgres>(
      'SELECT * FROM organisations WHERE nom = $1 LIMIT 1',
      [nom],
    );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(MapperOrganisationPostgres.depuisPersistance(ligne));
  }

  // Cette methode retourne une lecture paginee des organisations.
  public async lister(pagination: Pagination): Promise<ResultatPagine<Organisation>> {
    return this.executerLecturePaginee<PersistanceOrganisationPostgres, Organisation>(
      'SELECT COUNT(*) AS total FROM organisations',
      [],
      'SELECT * FROM organisations ORDER BY nom ASC, code ASC',
      [],
      pagination,
      (ligne) => this.marquerAgregatCharge(MapperOrganisationPostgres.depuisPersistance(ligne)),
    );
  }

  // Cette methode persiste l'etat courant d'une organisation.
  public async sauvegarder(organisation: Organisation): Promise<void> {
    const enregistrement = MapperOrganisationPostgres.versPersistance(organisation);
    const colonnes = [
      'id',
      'code',
      'nom',
      'type_organisation',
      'actif',
      'description',
      'cree_le',
      'cree_par',
      'promoteur_principal_utilisateur_id',
      'promoteur_principal_nom_complet',
      'promoteur_principal_email',
      'promoteur_principal_telephone',
      'promoteur_principal_identifiant',
      'modifie_le',
      'modifie_par',
      'version',
    ] as const;

    await this.sauvegarderAgregatVersionne(
      organisation,
      'organisations',
      'id',
      organisation.obtenirId().obtenirValeur(),
      colonnes,
      this.extraireValeurs(enregistrement, colonnes),
    );
  }
}
