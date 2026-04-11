import { Pagination, ResultatPagine } from '../../../../../../shared/application/Pagination';
import { ClasseAcademique } from '../../../../domain/aggregates/ClasseAcademique';
import { DepotClasseAcademique as ContratDepotClasseAcademique } from '../../../../domain/repositories/DepotClasseAcademique';
import { ClasseAcademiqueId } from '../../../../domain/value-objects/ClasseAcademiqueId';
import { SectionScolaireId } from '../../../../domain/value-objects/SectionScolaireId';
import {
  MapperClasseAcademiquePostgres,
  PersistanceClasseAcademiquePostgres,
} from '../mappers/MappersStructuresGlobalesPostgres';
import { ContexteExecutionTenantReferentielAcademique } from '../../../tenancy/ContexteExecutionTenantReferentielAcademique';
import { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import { BaseDepotPostgresReferentielAcademique } from './BaseDepotPostgresReferentielAcademique';
import { ClientPostgresReferentielAcademique } from './ClientPostgresReferentielAcademique';

// Ce depot implemente la persistance PostgreSQL des classes academiques officielles.
export class DepotClasseAcademiquePostgres
  extends BaseDepotPostgresReferentielAcademique
  implements ContratDepotClasseAcademique
{
  // Ce constructeur injecte le client PostgreSQL et l'unite de travail optionnelle.
  constructor(
    clientLecture: ClientPostgresReferentielAcademique,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresReferentielAcademique>,
    contexteExecutionTenant?: ContexteExecutionTenantReferentielAcademique,
  ) {
    super(clientLecture, uniteDeTravail, contexteExecutionTenant);
  }

  // Cette methode recherche une classe academique par son identifiant metier.
  public async trouverParId(idClasseAcademique: ClasseAcademiqueId): Promise<ClasseAcademique | null> {
    const ligne = await this.executerRequeteUnique<PersistanceClasseAcademiquePostgres>(
      'SELECT * FROM classes_academiques WHERE id = $1 LIMIT 1',
      [idClasseAcademique.obtenirValeur()],
    );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(MapperClasseAcademiquePostgres.depuisPersistance(ligne));
  }

  // Cette methode recherche une classe academique par son code fonctionnel.
  public async trouverParCode(code: string): Promise<ClasseAcademique | null> {
    const ligne = await this.executerRequeteUnique<PersistanceClasseAcademiquePostgres>(
      'SELECT * FROM classes_academiques WHERE code = $1 LIMIT 1',
      [code],
    );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(MapperClasseAcademiquePostgres.depuisPersistance(ligne));
  }

  // Cette methode liste les classes academiques d'une section scolaire.
  public async listerParSection(
    idSectionScolaire: SectionScolaireId,
    pagination: Pagination,
  ): Promise<ResultatPagine<ClasseAcademique>> {
    const idSection = idSectionScolaire.obtenirValeur();

    return this.executerLecturePaginee<PersistanceClasseAcademiquePostgres, ClasseAcademique>(
      'SELECT COUNT(*) AS total FROM classes_academiques WHERE id_section_scolaire = $1',
      [idSection],
      'SELECT * FROM classes_academiques WHERE id_section_scolaire = $1 ORDER BY ordre_pedagogique ASC, libelle ASC',
      [idSection],
      pagination,
      (ligne) => this.marquerAgregatCharge(MapperClasseAcademiquePostgres.depuisPersistance(ligne)),
    );
  }

  // Cette methode retourne une lecture paginee de l'ensemble des classes academiques.
  public async lister(pagination: Pagination): Promise<ResultatPagine<ClasseAcademique>> {
    return this.executerLecturePaginee<PersistanceClasseAcademiquePostgres, ClasseAcademique>(
      'SELECT COUNT(*) AS total FROM classes_academiques',
      [],
      'SELECT * FROM classes_academiques ORDER BY ordre_pedagogique ASC, libelle ASC',
      [],
      pagination,
      (ligne) => this.marquerAgregatCharge(MapperClasseAcademiquePostgres.depuisPersistance(ligne)),
    );
  }

  // Cette methode persiste l'etat courant d'une classe academique.
  public async sauvegarder(classeAcademique: ClasseAcademique): Promise<void> {
    const enregistrement = MapperClasseAcademiquePostgres.versPersistance(classeAcademique);
    const colonnes = [
      'id',
      'id_section_scolaire',
      'id_option_etude',
      'code',
      'libelle',
      'ordre_pedagogique',
      'cycle',
      'accepte_options',
      'option_obligatoire',
      'type_structure_evaluation',
      'active',
      'cree_le',
      'modifie_le',
      'version',
    ] as const;

    await this.sauvegarderAgregatVersionne(
      classeAcademique,
      'classes_academiques',
      'id',
      classeAcademique.obtenirId().obtenirValeur(),
      colonnes,
      this.extraireValeurs(enregistrement, colonnes),
    );
  }
}
