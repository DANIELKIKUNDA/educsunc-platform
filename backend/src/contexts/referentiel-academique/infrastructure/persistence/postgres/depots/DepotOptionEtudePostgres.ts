import { Pagination, ResultatPagine } from '../../../../../../shared/application/Pagination';
import { OptionEtude } from '../../../../domain/aggregates/OptionEtude';
import { DepotOptionEtude as ContratDepotOptionEtude } from '../../../../domain/repositories/DepotOptionEtude';
import { OptionEtudeId } from '../../../../domain/value-objects/OptionEtudeId';
import {
  MapperOptionEtudePostgres,
  PersistanceOptionEtudePostgres,
} from '../mappers/MappersStructuresGlobalesPostgres';
import { ContexteExecutionTenantReferentielAcademique } from '../../../tenancy/ContexteExecutionTenantReferentielAcademique';
import { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import { BaseDepotPostgresReferentielAcademique } from './BaseDepotPostgresReferentielAcademique';
import { ClientPostgresReferentielAcademique } from './ClientPostgresReferentielAcademique';

// Ce depot implemente la persistance PostgreSQL des options d'etudes officielles.
export class DepotOptionEtudePostgres
  extends BaseDepotPostgresReferentielAcademique
  implements ContratDepotOptionEtude
{
  // Ce constructeur injecte le client PostgreSQL et l'unite de travail optionnelle.
  constructor(
    clientLecture: ClientPostgresReferentielAcademique,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresReferentielAcademique>,
    contexteExecutionTenant?: ContexteExecutionTenantReferentielAcademique,
  ) {
    super(clientLecture, uniteDeTravail, contexteExecutionTenant);
  }

  // Cette methode recherche une option d'etude par son identifiant metier.
  public async trouverParId(idOptionEtude: OptionEtudeId): Promise<OptionEtude | null> {
    const ligne = await this.executerRequeteUnique<PersistanceOptionEtudePostgres>(
      'SELECT * FROM options_etudes WHERE id = $1 LIMIT 1',
      [idOptionEtude.obtenirValeur()],
    );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(MapperOptionEtudePostgres.depuisPersistance(ligne));
  }

  // Cette methode recherche une option d'etude par son code officiel.
  public async trouverParCode(code: number): Promise<OptionEtude | null> {
    const ligne = await this.executerRequeteUnique<PersistanceOptionEtudePostgres>(
      'SELECT * FROM options_etudes WHERE code = $1 LIMIT 1',
      [code],
    );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(MapperOptionEtudePostgres.depuisPersistance(ligne));
  }

  // Cette methode liste les options d'etudes actives.
  public async listerActives(): Promise<OptionEtude[]> {
    const lignes = await this.executerRequete<PersistanceOptionEtudePostgres>(
      'SELECT * FROM options_etudes WHERE active = true ORDER BY ordre_affichage ASC NULLS LAST, libelle ASC',
    );

    return lignes.map((ligne) =>
      this.marquerAgregatCharge(MapperOptionEtudePostgres.depuisPersistance(ligne)));
  }

  // Cette methode retourne une lecture paginee des options d'etudes.
  public async lister(pagination: Pagination): Promise<ResultatPagine<OptionEtude>> {
    return this.executerLecturePaginee<PersistanceOptionEtudePostgres, OptionEtude>(
      'SELECT COUNT(*) AS total FROM options_etudes',
      [],
      'SELECT * FROM options_etudes ORDER BY ordre_affichage ASC NULLS LAST, libelle ASC',
      [],
      pagination,
      (ligne) => this.marquerAgregatCharge(MapperOptionEtudePostgres.depuisPersistance(ligne)),
    );
  }

  // Cette methode persiste l'etat courant d'une option d'etude.
  public async sauvegarder(optionEtude: OptionEtude): Promise<void> {
    const enregistrement = MapperOptionEtudePostgres.versPersistance(optionEtude);
    const colonnes = [
      'id',
      'code',
      'libelle',
      'type_option',
      'abreviation',
      'ordre_affichage',
      'active',
      'cree_le',
      'modifie_le',
      'version',
    ] as const;

    await this.sauvegarderAgregatVersionne(
      optionEtude,
      'options_etudes',
      'id',
      optionEtude.obtenirId().obtenirValeur(),
      colonnes,
      this.extraireValeurs(enregistrement, colonnes),
    );
  }
}
