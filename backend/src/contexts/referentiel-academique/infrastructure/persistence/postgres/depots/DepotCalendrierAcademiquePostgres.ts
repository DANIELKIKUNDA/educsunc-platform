import { CalendrierAcademique } from '../../../../domain/aggregates/CalendrierAcademique';
import { DepotCalendrierAcademique as ContratDepotCalendrierAcademique } from '../../../../domain/repositories/DepotCalendrierAcademique';
import { AnneeScolaireId } from '../../../../domain/value-objects/AnneeScolaireId';
import { CalendrierAcademiqueId } from '../../../../domain/value-objects/CalendrierAcademiqueId';
import { EcoleId } from '../../../../domain/value-objects/EcoleId';
import {
  MapperCalendrierAcademiquePostgres,
  PersistanceCalendrierAcademiquePostgres,
  PersistancePeriodeCalendrierPostgres,
} from '../mappers/MappersExploitationLocalePostgres';
import { ContexteExecutionTenantReferentielAcademique } from '../../../tenancy/ContexteExecutionTenantReferentielAcademique';
import { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import { BaseDepotPostgresReferentielAcademique } from './BaseDepotPostgresReferentielAcademique';
import { ClientPostgresReferentielAcademique } from './ClientPostgresReferentielAcademique';

// Ce depot implemente la persistance PostgreSQL des calendriers academiques locaux.
export class DepotCalendrierAcademiquePostgres
  extends BaseDepotPostgresReferentielAcademique
  implements ContratDepotCalendrierAcademique
{
  // Ce constructeur injecte le client PostgreSQL et l'unite de travail optionnelle.
  constructor(
    clientLecture: ClientPostgresReferentielAcademique,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresReferentielAcademique>,
    contexteExecutionTenant?: ContexteExecutionTenantReferentielAcademique,
  ) {
    super(clientLecture, uniteDeTravail, contexteExecutionTenant);
  }

  // Cette methode recherche un calendrier academique par son identifiant metier.
  public async trouverParId(
    idCalendrierAcademique: CalendrierAcademiqueId,
  ): Promise<CalendrierAcademique | null> {
    const clauseIsolation = this.construireClauseIsolationLectureParEcole('"id_ecole"', 2);
    const parent = await this.executerRequeteUnique<PersistanceCalendrierAcademiquePostgres>(
      `SELECT * FROM calendriers_academiques WHERE id = $1 ${clauseIsolation.clauseSql} LIMIT 1`,
      [idCalendrierAcademique.obtenirValeur(), ...clauseIsolation.parametres],
    );

    if (parent === null) {
      return null;
    }

    const periodes = await this.chargerPeriodes(parent.id);

    return this.marquerAgregatCharge(
      MapperCalendrierAcademiquePostgres.depuisPersistance(parent, periodes),
    );
  }

  // Cette methode retrouve le calendrier d'une ecole pour une annee donnee.
  public async trouverParEcoleEtAnnee(
    idEcole: EcoleId,
    idAnneeScolaire: AnneeScolaireId,
  ): Promise<CalendrierAcademique | null> {
    const clauseIsolation = this.construireClauseIsolationLectureParEcole('"id_ecole"', 3);
    const parent = await this.executerRequeteUnique<PersistanceCalendrierAcademiquePostgres>(
      [
        'SELECT * FROM calendriers_academiques',
        `WHERE id_ecole = $1 AND id_annee_scolaire = $2 ${clauseIsolation.clauseSql}`,
        'LIMIT 1',
      ].join(' '),
      [idEcole.obtenirValeur(), idAnneeScolaire.obtenirValeur(), ...clauseIsolation.parametres],
    );

    if (parent === null) {
      return null;
    }

    const periodes = await this.chargerPeriodes(parent.id);

    return this.marquerAgregatCharge(
      MapperCalendrierAcademiquePostgres.depuisPersistance(parent, periodes),
    );
  }

  // Cette methode persiste l'etat courant d'un calendrier academique.
  public async sauvegarder(calendrierAcademique: CalendrierAcademique): Promise<void> {
    const parent = MapperCalendrierAcademiquePostgres.versPersistance(calendrierAcademique);
    const periodes = MapperCalendrierAcademiquePostgres.versPeriodesPersistance(calendrierAcademique);
    const colonnesParent = [
      'id',
      'id_ecole',
      'id_annee_scolaire',
      'type_structure_evaluation',
      'date_debut_annee',
      'date_fin_annee',
      'verrouille',
      'cree_le',
      'cree_par',
      'modifie_le',
      'modifie_par',
      'version',
    ] as const;
    const colonnesPeriode = [
      'id',
      'id_calendrier_academique',
      'code',
      'libelle',
      'ordre',
      'type_periode',
      'date_debut',
      'date_fin',
    ] as const;

    this.verifierEcritureLocaleAutorisee(calendrierAcademique.obtenirEcoleId().obtenirValeur());

    await this.sauvegarderAgregatVersionne(
      calendrierAcademique,
      'calendriers_academiques',
      'id',
      calendrierAcademique.obtenirId().obtenirValeur(),
      colonnesParent,
      this.extraireValeurs(parent, colonnesParent),
    );

    await this.remplacerCollectionEnfants(
      'periodes_calendrier',
      'id_calendrier_academique',
      parent.id,
      colonnesPeriode,
      periodes,
      (periode) => this.extraireValeurs(periode, colonnesPeriode),
    );
  }

  private async chargerPeriodes(
    idCalendrierAcademique: string,
  ): Promise<readonly PersistancePeriodeCalendrierPostgres[]> {
    return this.executerRequete<PersistancePeriodeCalendrierPostgres>(
      [
        'SELECT * FROM periodes_calendrier',
        'WHERE id_calendrier_academique = $1',
        'ORDER BY ordre ASC, code ASC',
      ].join(' '),
      [idCalendrierAcademique],
    );
  }
}
