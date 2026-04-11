import { Pagination, ResultatPagine } from '../../../../../../shared/application/Pagination';
import { ClassePedagogique } from '../../../../domain/aggregates/ClassePedagogique';
import { DepotClassePedagogique as ContratDepotClassePedagogique } from '../../../../domain/repositories/DepotClassePedagogique';
import { AnneeScolaireId } from '../../../../domain/value-objects/AnneeScolaireId';
import { ClassePedagogiqueId } from '../../../../domain/value-objects/ClassePedagogiqueId';
import { EcoleId } from '../../../../domain/value-objects/EcoleId';
import {
  MapperClassePedagogiquePostgres,
  PersistanceClassePedagogiquePostgres,
} from '../mappers/MappersExploitationLocalePostgres';
import { ContexteExecutionTenantReferentielAcademique } from '../../../tenancy/ContexteExecutionTenantReferentielAcademique';
import { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import { BaseDepotPostgresReferentielAcademique } from './BaseDepotPostgresReferentielAcademique';
import { ClientPostgresReferentielAcademique } from './ClientPostgresReferentielAcademique';

// Ce depot implemente la persistance PostgreSQL des classes pedagogiques locales.
export class DepotClassePedagogiquePostgres
  extends BaseDepotPostgresReferentielAcademique
  implements ContratDepotClassePedagogique
{
  // Ce constructeur injecte le client PostgreSQL et l'unite de travail optionnelle.
  constructor(
    clientLecture: ClientPostgresReferentielAcademique,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresReferentielAcademique>,
    contexteExecutionTenant?: ContexteExecutionTenantReferentielAcademique,
  ) {
    super(clientLecture, uniteDeTravail, contexteExecutionTenant);
  }

  // Cette methode recherche une classe pedagogique par son identifiant metier.
  public async trouverParId(
    idClassePedagogique: ClassePedagogiqueId,
  ): Promise<ClassePedagogique | null> {
    const clauseIsolation = this.construireClauseIsolationLectureParEcole('"id_ecole"', 2);
    const ligne = await this.executerRequeteUnique<PersistanceClassePedagogiquePostgres>(
      `SELECT * FROM classes_pedagogiques WHERE id = $1 ${clauseIsolation.clauseSql} LIMIT 1`,
      [idClassePedagogique.obtenirValeur(), ...clauseIsolation.parametres],
    );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(MapperClassePedagogiquePostgres.depuisPersistance(ligne));
  }

  // Cette methode recherche une classe pedagogique par code dans un contexte ecole/annee.
  public async trouverParCodeDansContexte(
    idEcole: EcoleId,
    idAnneeScolaire: AnneeScolaireId,
    code: string,
  ): Promise<ClassePedagogique | null> {
    const clauseIsolation = this.construireClauseIsolationLectureParEcole('"id_ecole"', 4);
    const ligne = await this.executerRequeteUnique<PersistanceClassePedagogiquePostgres>(
      [
        'SELECT * FROM classes_pedagogiques',
        `WHERE id_ecole = $1 AND id_annee_scolaire = $2 AND code = $3 ${clauseIsolation.clauseSql}`,
        'LIMIT 1',
      ].join(' '),
      [idEcole.obtenirValeur(), idAnneeScolaire.obtenirValeur(), code, ...clauseIsolation.parametres],
    );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(MapperClassePedagogiquePostgres.depuisPersistance(ligne));
  }

  // Cette methode liste les classes pedagogiques d'une ecole pour une annee donnee.
  public async listerParEcoleEtAnnee(
    idEcole: EcoleId,
    idAnneeScolaire: AnneeScolaireId,
    pagination: Pagination,
  ): Promise<ResultatPagine<ClassePedagogique>> {
    const idEcoleValeur = idEcole.obtenirValeur();
    const idAnneeValeur = idAnneeScolaire.obtenirValeur();
    const clauseIsolation = this.construireClauseIsolationLectureParEcole('"id_ecole"', 3);

    return this.executerLecturePaginee<PersistanceClassePedagogiquePostgres, ClassePedagogique>(
      `SELECT COUNT(*) AS total FROM classes_pedagogiques WHERE id_ecole = $1 AND id_annee_scolaire = $2 ${clauseIsolation.clauseSql}`,
      [idEcoleValeur, idAnneeValeur, ...clauseIsolation.parametres],
      [
        'SELECT * FROM classes_pedagogiques',
        `WHERE id_ecole = $1 AND id_annee_scolaire = $2 ${clauseIsolation.clauseSql}`,
        'ORDER BY libelle ASC, code ASC',
      ].join(' '),
      [idEcoleValeur, idAnneeValeur, ...clauseIsolation.parametres],
      pagination,
      (ligne) => this.marquerAgregatCharge(MapperClassePedagogiquePostgres.depuisPersistance(ligne)),
    );
  }

  // Cette methode persiste l'etat courant d'une classe pedagogique.
  public async sauvegarder(classePedagogique: ClassePedagogique): Promise<void> {
    const enregistrement = MapperClassePedagogiquePostgres.versPersistance(classePedagogique);
    const colonnes = [
      'id',
      'id_ecole',
      'id_annee_scolaire',
      'id_classe_academique',
      'suffixe_parallele',
      'code',
      'libelle',
      'capacite_accueil',
      'active',
      'archive_le',
      'cree_le',
      'modifie_le',
      'version',
    ] as const;

    this.verifierEcritureLocaleAutorisee(classePedagogique.obtenirEcoleId().obtenirValeur());

    await this.sauvegarderAgregatVersionne(
      classePedagogique,
      'classes_pedagogiques',
      'id',
      classePedagogique.obtenirId().obtenirValeur(),
      colonnes,
      this.extraireValeurs(enregistrement, colonnes),
    );
  }
}
