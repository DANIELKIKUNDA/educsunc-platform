import { ResponsabiliteClassePedagogique } from '../../../../domain/aggregates/ResponsabiliteClassePedagogique';
import { DepotResponsabiliteClassePedagogique as ContratDepotResponsabiliteClassePedagogique } from '../../../../domain/repositories/DepotResponsabiliteClassePedagogique';
import { AnneeScolaireId } from '../../../../domain/value-objects/AnneeScolaireId';
import { ClassePedagogiqueId } from '../../../../domain/value-objects/ClassePedagogiqueId';
import { ContexteExecutionTenantReferentielAcademique } from '../../../tenancy/ContexteExecutionTenantReferentielAcademique';
import { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import { BaseDepotPostgresReferentielAcademique } from './BaseDepotPostgresReferentielAcademique';
import { ClientPostgresReferentielAcademique } from './ClientPostgresReferentielAcademique';
import {
  PersistanceResponsabiliteClassePedagogiquePostgres,
  ResponsabiliteClassePedagogiquePostgresMapper,
} from '../mappers/ResponsabiliteClassePedagogiquePostgresMapper';

// Ce depot implemente la persistance PostgreSQL des responsabilites de classes pedagogiques.
export class DepotResponsabiliteClassePedagogiquePostgres
  extends BaseDepotPostgresReferentielAcademique
  implements ContratDepotResponsabiliteClassePedagogique
{
  constructor(
    clientLecture: ClientPostgresReferentielAcademique,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresReferentielAcademique>,
    contexteExecutionTenant?: ContexteExecutionTenantReferentielAcademique,
  ) {
    super(clientLecture, uniteDeTravail, contexteExecutionTenant);
  }

  public async trouverActiveParClasseEtAnnee(
    idClassePedagogique: ClassePedagogiqueId,
    idAnneeScolaire: AnneeScolaireId,
  ): Promise<ResponsabiliteClassePedagogique | null> {
    const clauseIsolation = this.construireClauseIsolationLectureParEcole('"id_ecole"', 3);
    const ligne =
      await this.executerRequeteUnique<PersistanceResponsabiliteClassePedagogiquePostgres>(
        [
          'SELECT * FROM responsabilites_classes_pedagogiques',
          `WHERE id_classe_pedagogique = $1 AND id_annee_scolaire = $2 AND active = true ${clauseIsolation.clauseSql}`,
          'LIMIT 1',
        ].join(' '),
        [
          idClassePedagogique.obtenirValeur(),
          idAnneeScolaire.obtenirValeur(),
          ...clauseIsolation.parametres,
        ],
      );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(
        ResponsabiliteClassePedagogiquePostgresMapper.depuisPersistance(ligne),
      );
  }

  public async listerActivesParUtilisateur(
    idUtilisateur: string,
  ): Promise<ResponsabiliteClassePedagogique[]> {
    const clauseIsolation = this.construireClauseIsolationLectureParEcole('"id_ecole"', 2);
    const lignes =
      await this.executerRequete<PersistanceResponsabiliteClassePedagogiquePostgres>(
        [
          'SELECT * FROM responsabilites_classes_pedagogiques',
          `WHERE id_utilisateur_enseignant = $1 AND active = true ${clauseIsolation.clauseSql}`,
          'ORDER BY id_annee_scolaire, id_classe_pedagogique',
        ].join(' '),
        [idUtilisateur, ...clauseIsolation.parametres],
      );

    return lignes.map((ligne) =>
      this.marquerAgregatCharge(
        ResponsabiliteClassePedagogiquePostgresMapper.depuisPersistance(ligne),
      ),
    );
  }

  public async sauvegarder(
    responsabiliteClassePedagogique: ResponsabiliteClassePedagogique,
  ): Promise<void> {
    const enregistrement =
      ResponsabiliteClassePedagogiquePostgresMapper.versPersistance(
        responsabiliteClassePedagogique,
      );
    const colonnes = [
      'id',
      'id_organisation',
      'id_ecole',
      'id_classe_pedagogique',
      'id_classe_academique',
      'id_section_scolaire',
      'id_annee_scolaire',
      'id_utilisateur_enseignant',
      'active',
      'date_debut',
      'date_fin',
      'cree_le',
      'cree_par',
      'version',
    ] as const;

    this.verifierEcritureLocaleAutorisee(
      responsabiliteClassePedagogique.obtenirIdEcole().obtenirValeur(),
    );

    await this.sauvegarderAgregatVersionne(
      responsabiliteClassePedagogique,
      'responsabilites_classes_pedagogiques',
      'id',
      responsabiliteClassePedagogique.obtenirId().obtenirValeur(),
      colonnes,
      this.extraireValeurs(enregistrement, colonnes),
    );
  }
}
