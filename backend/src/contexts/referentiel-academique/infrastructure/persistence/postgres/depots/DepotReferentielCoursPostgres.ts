import { Pagination, ResultatPagine } from '../../../../../../shared/application/Pagination';
import { ReferentielCours } from '../../../../domain/aggregates/ReferentielCours';
import { DepotReferentielCours as ContratDepotReferentielCours } from '../../../../domain/repositories/DepotReferentielCours';
import { ReferentielCoursId } from '../../../../domain/value-objects/ReferentielCoursId';
import {
  MapperReferentielCoursPostgres,
  PersistanceReferentielCoursPostgres,
} from '../mappers/MappersStructuresGlobalesPostgres';
import { ContexteExecutionTenantReferentielAcademique } from '../../../tenancy/ContexteExecutionTenantReferentielAcademique';
import { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import { BaseDepotPostgresReferentielAcademique } from './BaseDepotPostgresReferentielAcademique';
import { ClientPostgresReferentielAcademique } from './ClientPostgresReferentielAcademique';

// Ce depot implemente la persistance PostgreSQL des cours officiels du referentiel.
export class DepotReferentielCoursPostgres
  extends BaseDepotPostgresReferentielAcademique
  implements ContratDepotReferentielCours
{
  // Ce constructeur injecte le client PostgreSQL et l'unite de travail optionnelle.
  constructor(
    clientLecture: ClientPostgresReferentielAcademique,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresReferentielAcademique>,
    contexteExecutionTenant?: ContexteExecutionTenantReferentielAcademique,
  ) {
    super(clientLecture, uniteDeTravail, contexteExecutionTenant);
  }

  // Cette methode recherche un cours officiel par son identifiant metier.
  public async trouverParId(idReferentielCours: ReferentielCoursId): Promise<ReferentielCours | null> {
    const ligne = await this.executerRequeteUnique<PersistanceReferentielCoursPostgres>(
      'SELECT * FROM referentiels_cours WHERE id = $1 LIMIT 1',
      [idReferentielCours.obtenirValeur()],
    );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(MapperReferentielCoursPostgres.depuisPersistance(ligne));
  }

  // Cette methode recherche un cours officiel par son code fonctionnel.
  public async trouverParCode(code: string): Promise<ReferentielCours | null> {
    const ligne = await this.executerRequeteUnique<PersistanceReferentielCoursPostgres>(
      'SELECT * FROM referentiels_cours WHERE code = $1 LIMIT 1',
      [code],
    );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(MapperReferentielCoursPostgres.depuisPersistance(ligne));
  }

  // Cette methode retourne une lecture paginee des cours officiels.
  public async lister(pagination: Pagination): Promise<ResultatPagine<ReferentielCours>> {
    return this.executerLecturePaginee<PersistanceReferentielCoursPostgres, ReferentielCours>(
      'SELECT COUNT(*) AS total FROM referentiels_cours',
      [],
      'SELECT * FROM referentiels_cours ORDER BY libelle ASC, code ASC',
      [],
      pagination,
      (ligne) => this.marquerAgregatCharge(MapperReferentielCoursPostgres.depuisPersistance(ligne)),
    );
  }

  // Cette methode persiste l'etat courant d'un cours officiel.
  public async sauvegarder(referentielCours: ReferentielCours): Promise<void> {
    const enregistrement = MapperReferentielCoursPostgres.versPersistance(referentielCours);
    const colonnes = [
      'id',
      'code',
      'libelle',
      'abreviation',
      'domaine',
      'sous_domaine',
      'actif',
      'cree_le',
      'modifie_le',
      'version',
    ] as const;

    await this.sauvegarderAgregatVersionne(
      referentielCours,
      'referentiels_cours',
      'id',
      referentielCours.obtenirId().obtenirValeur(),
      colonnes,
      this.extraireValeurs(enregistrement, colonnes),
    );
  }
}
