import { Pagination, ResultatPagine } from '../../../../../../shared/application/Pagination';
import { SectionScolaire } from '../../../../domain/aggregates/SectionScolaire';
import { DepotSectionScolaire as ContratDepotSectionScolaire } from '../../../../domain/repositories/DepotSectionScolaire';
import { SectionScolaireId } from '../../../../domain/value-objects/SectionScolaireId';
import {
  MapperSectionScolairePostgres,
  PersistanceSectionScolairePostgres,
} from '../mappers/MappersStructuresGlobalesPostgres';
import { ContexteExecutionTenantReferentielAcademique } from '../../../tenancy/ContexteExecutionTenantReferentielAcademique';
import { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import { BaseDepotPostgresReferentielAcademique } from './BaseDepotPostgresReferentielAcademique';
import { ClientPostgresReferentielAcademique } from './ClientPostgresReferentielAcademique';

// Ce depot implemente la persistance PostgreSQL des sections scolaires officielles.
export class DepotSectionScolairePostgres
  extends BaseDepotPostgresReferentielAcademique
  implements ContratDepotSectionScolaire
{
  // Ce constructeur injecte le client PostgreSQL et l'unite de travail optionnelle.
  constructor(
    clientLecture: ClientPostgresReferentielAcademique,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresReferentielAcademique>,
    contexteExecutionTenant?: ContexteExecutionTenantReferentielAcademique,
  ) {
    super(clientLecture, uniteDeTravail, contexteExecutionTenant);
  }

  // Cette methode recherche une section scolaire par son identifiant metier.
  public async trouverParId(idSectionScolaire: SectionScolaireId): Promise<SectionScolaire | null> {
    const ligne = await this.executerRequeteUnique<PersistanceSectionScolairePostgres>(
      'SELECT * FROM sections_scolaires WHERE id = $1 LIMIT 1',
      [idSectionScolaire.obtenirValeur()],
    );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(MapperSectionScolairePostgres.depuisPersistance(ligne));
  }

  // Cette methode recherche une section scolaire par son code fonctionnel.
  public async trouverParCode(code: string): Promise<SectionScolaire | null> {
    const ligne = await this.executerRequeteUnique<PersistanceSectionScolairePostgres>(
      'SELECT * FROM sections_scolaires WHERE code = $1 LIMIT 1',
      [code],
    );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(MapperSectionScolairePostgres.depuisPersistance(ligne));
  }

  // Cette methode liste les sections scolaires actives.
  public async listerActives(): Promise<SectionScolaire[]> {
    const lignes = await this.executerRequete<PersistanceSectionScolairePostgres>(
      'SELECT * FROM sections_scolaires WHERE active = true ORDER BY ordre_affichage ASC, libelle ASC',
    );

    return lignes.map((ligne) =>
      this.marquerAgregatCharge(MapperSectionScolairePostgres.depuisPersistance(ligne)));
  }

  // Cette methode retourne une lecture paginee des sections scolaires.
  public async lister(pagination: Pagination): Promise<ResultatPagine<SectionScolaire>> {
    return this.executerLecturePaginee<PersistanceSectionScolairePostgres, SectionScolaire>(
      'SELECT COUNT(*) AS total FROM sections_scolaires',
      [],
      'SELECT * FROM sections_scolaires ORDER BY ordre_affichage ASC, libelle ASC',
      [],
      pagination,
      (ligne) => this.marquerAgregatCharge(MapperSectionScolairePostgres.depuisPersistance(ligne)),
    );
  }

  // Cette methode persiste l'etat courant d'une section scolaire.
  public async sauvegarder(sectionScolaire: SectionScolaire): Promise<void> {
    const enregistrement = MapperSectionScolairePostgres.versPersistance(sectionScolaire);
    const colonnes = [
      'id',
      'code',
      'libelle',
      'ordre_affichage',
      'active',
      'cree_le',
      'modifie_le',
      'version',
    ] as const;

    await this.sauvegarderAgregatVersionne(
      sectionScolaire,
      'sections_scolaires',
      'id',
      sectionScolaire.obtenirId().obtenirValeur(),
      colonnes,
      this.extraireValeurs(enregistrement, colonnes),
    );
  }
}
