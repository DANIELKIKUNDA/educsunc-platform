import { Pagination, ResultatPagine } from '../../../../../../shared/application/Pagination';
import { AnneeScolaire } from '../../../../domain/aggregates/AnneeScolaire';
import { DepotAnneeScolaire as ContratDepotAnneeScolaire } from '../../../../domain/repositories/DepotAnneeScolaire';
import { AnneeScolaireId } from '../../../../domain/value-objects/AnneeScolaireId';
import { EcoleId } from '../../../../domain/value-objects/EcoleId';
import { StatutAnneeScolaire } from '../../../../domain/value-objects/StatutAnneeScolaire';
import {
  MapperAnneeScolairePostgres,
  PersistanceAnneeScolairePostgres,
} from '../mappers/MappersExploitationLocalePostgres';
import { ContexteExecutionTenantReferentielAcademique } from '../../../tenancy/ContexteExecutionTenantReferentielAcademique';
import { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import { BaseDepotPostgresReferentielAcademique } from './BaseDepotPostgresReferentielAcademique';
import { ClientPostgresReferentielAcademique } from './ClientPostgresReferentielAcademique';

// Ce depot implemente la persistance PostgreSQL des annees scolaires locales.
export class DepotAnneeScolairePostgres
  extends BaseDepotPostgresReferentielAcademique
  implements ContratDepotAnneeScolaire
{
  // Ce constructeur injecte le client PostgreSQL et l'unite de travail optionnelle.
  constructor(
    clientLecture: ClientPostgresReferentielAcademique,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresReferentielAcademique>,
    contexteExecutionTenant?: ContexteExecutionTenantReferentielAcademique,
  ) {
    super(clientLecture, uniteDeTravail, contexteExecutionTenant);
  }

  // Cette methode recherche une annee scolaire par son identifiant metier.
  public async trouverParId(idAnneeScolaire: AnneeScolaireId): Promise<AnneeScolaire | null> {
    const clauseIsolation = this.construireClauseIsolationLectureParEcole('"id_ecole"', 2);
    const ligne = await this.executerRequeteUnique<PersistanceAnneeScolairePostgres>(
      `SELECT * FROM annees_scolaires WHERE id = $1 ${clauseIsolation.clauseSql} LIMIT 1`,
      [idAnneeScolaire.obtenirValeur(), ...clauseIsolation.parametres],
    );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(MapperAnneeScolairePostgres.depuisPersistance(ligne));
  }

  // Cette methode retrouve l'annee scolaire active d'une ecole si elle existe.
  public async trouverActiveParEcole(idEcole: EcoleId): Promise<AnneeScolaire | null> {
    const clauseIsolation = this.construireClauseIsolationLectureParEcole('"id_ecole"', 2);
    const ligne = await this.executerRequeteUnique<PersistanceAnneeScolairePostgres>(
      `SELECT * FROM annees_scolaires WHERE id_ecole = $1 ${clauseIsolation.clauseSql} AND active = true LIMIT 1`,
      [idEcole.obtenirValeur(), ...clauseIsolation.parametres],
    );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(MapperAnneeScolairePostgres.depuisPersistance(ligne));
  }

  // Cette methode retrouve une annee scolaire par son code fonctionnel dans une ecole.
  public async trouverParCodeEtEcole(
    idEcole: EcoleId,
    code: string,
  ): Promise<AnneeScolaire | null> {
    const clauseIsolation = this.construireClauseIsolationLectureParEcole('"id_ecole"', 3);
    const ligne = await this.executerRequeteUnique<PersistanceAnneeScolairePostgres>(
      `SELECT * FROM annees_scolaires WHERE id_ecole = $1 AND code = $2 ${clauseIsolation.clauseSql} LIMIT 1`,
      [idEcole.obtenirValeur(), code.trim(), ...clauseIsolation.parametres],
    );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(MapperAnneeScolairePostgres.depuisPersistance(ligne));
  }

  // Cette methode retrouve la derniere annee scolaire connue d'une ecole.
  public async trouverDerniereParEcole(idEcole: EcoleId): Promise<AnneeScolaire | null> {
    const clauseIsolation = this.construireClauseIsolationLectureParEcole('"id_ecole"', 2);
    const ligne = await this.executerRequeteUnique<PersistanceAnneeScolairePostgres>(
      [
        'SELECT * FROM annees_scolaires',
        `WHERE id_ecole = $1 ${clauseIsolation.clauseSql}`,
        'ORDER BY date_debut DESC, code DESC',
        'LIMIT 1',
      ].join(' '),
      [idEcole.obtenirValeur(), ...clauseIsolation.parametres],
    );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(MapperAnneeScolairePostgres.depuisPersistance(ligne));
  }

  // Cette methode liste les annees scolaires planifiees d'une ecole.
  public async listerPlanifieesParEcole(idEcole: EcoleId): Promise<readonly AnneeScolaire[]> {
    const clauseIsolation = this.construireClauseIsolationLectureParEcole('"id_ecole"', 3);
    const lignes = await this.executerRequete<PersistanceAnneeScolairePostgres>(
      [
        'SELECT * FROM annees_scolaires',
        `WHERE id_ecole = $1 AND statut = $2 ${clauseIsolation.clauseSql}`,
        'ORDER BY date_debut ASC, code ASC',
      ].join(' '),
      [
        idEcole.obtenirValeur(),
        StatutAnneeScolaire.PLANIFIEE,
        ...clauseIsolation.parametres,
      ],
    );

    return lignes.map((ligne) =>
      this.marquerAgregatCharge(MapperAnneeScolairePostgres.depuisPersistance(ligne))
    );
  }

  // Cette methode verrouille l'annee active pendant une transition transactionnelle.
  public async verrouillerActiveParEcole(idEcole: EcoleId): Promise<AnneeScolaire | null> {
    const clauseIsolation = this.construireClauseIsolationLectureParEcole('"id_ecole"', 2);
    const ligne = await this.executerRequeteUnique<PersistanceAnneeScolairePostgres>(
      [
        'SELECT * FROM annees_scolaires',
        `WHERE id_ecole = $1 ${clauseIsolation.clauseSql} AND active = true`,
        'LIMIT 1',
        'FOR UPDATE',
      ].join(' '),
      [idEcole.obtenirValeur(), ...clauseIsolation.parametres],
    );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(MapperAnneeScolairePostgres.depuisPersistance(ligne));
  }

  // Cette methode liste les annees scolaires d'une ecole avec pagination.
  public async listerParEcole(
    idEcole: EcoleId,
    pagination: Pagination,
  ): Promise<ResultatPagine<AnneeScolaire>> {
    const idEcoleValeur = idEcole.obtenirValeur();
    const clauseIsolation = this.construireClauseIsolationLectureParEcole('"id_ecole"', 2);

    return this.executerLecturePaginee<PersistanceAnneeScolairePostgres, AnneeScolaire>(
      `SELECT COUNT(*) AS total FROM annees_scolaires WHERE id_ecole = $1 ${clauseIsolation.clauseSql}`,
      [idEcoleValeur, ...clauseIsolation.parametres],
      `SELECT * FROM annees_scolaires WHERE id_ecole = $1 ${clauseIsolation.clauseSql} ORDER BY date_debut DESC, code DESC`,
      [idEcoleValeur, ...clauseIsolation.parametres],
      pagination,
      (ligne) => this.marquerAgregatCharge(MapperAnneeScolairePostgres.depuisPersistance(ligne)),
    );
  }

  // Cette methode persiste l'etat courant d'une annee scolaire.
  public async sauvegarder(anneeScolaire: AnneeScolaire): Promise<void> {
    const enregistrement = MapperAnneeScolairePostgres.versPersistance(anneeScolaire);
    const colonnes = [
      'id',
      'id_ecole',
      'code',
      'libelle',
      'date_debut',
      'date_fin',
      'statut',
      'active',
      'date_activation',
      'date_cloture',
      'date_archivage',
      'cree_le',
      'cree_par',
      'modifie_le',
      'modifie_par',
      'version',
    ] as const;

    this.verifierEcritureLocaleAutorisee(anneeScolaire.obtenirEcoleId().obtenirValeur());

    await this.sauvegarderAgregatVersionne(
      anneeScolaire,
      'annees_scolaires',
      'id',
      anneeScolaire.obtenirId().obtenirValeur(),
      colonnes,
      this.extraireValeurs(enregistrement, colonnes),
    );
  }
}
