import { Pagination, ResultatPagine } from '../../../../../../shared/application/Pagination';
import { ProgrammeNiveau } from '../../../../domain/aggregates/ProgrammeNiveau';
import { DepotProgrammeNiveau as ContratDepotProgrammeNiveau } from '../../../../domain/repositories/DepotProgrammeNiveau';
import { AnneeScolaireId } from '../../../../domain/value-objects/AnneeScolaireId';
import { ClasseAcademiqueId } from '../../../../domain/value-objects/ClasseAcademiqueId';
import { EcoleId } from '../../../../domain/value-objects/EcoleId';
import { ProgrammeNiveauId } from '../../../../domain/value-objects/ProgrammeNiveauId';
import {
  MapperProgrammeNiveauPostgres,
  PersistanceLigneProgrammeNiveauPostgres,
  PersistanceProgrammeNiveauPostgres,
} from '../mappers/MappersExploitationLocalePostgres';
import { ContexteExecutionTenantReferentielAcademique } from '../../../tenancy/ContexteExecutionTenantReferentielAcademique';
import { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import { BaseDepotPostgresReferentielAcademique } from './BaseDepotPostgresReferentielAcademique';
import { ClientPostgresReferentielAcademique } from './ClientPostgresReferentielAcademique';

// Ce depot implemente la persistance PostgreSQL des programmes niveau locaux.
export class DepotProgrammeNiveauPostgres
  extends BaseDepotPostgresReferentielAcademique
  implements ContratDepotProgrammeNiveau
{
  // Ce constructeur injecte le client PostgreSQL et l'unite de travail optionnelle.
  constructor(
    clientLecture: ClientPostgresReferentielAcademique,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresReferentielAcademique>,
    contexteExecutionTenant?: ContexteExecutionTenantReferentielAcademique,
  ) {
    super(clientLecture, uniteDeTravail, contexteExecutionTenant);
  }

  // Cette methode recherche un programme niveau par son identifiant metier.
  public async trouverParId(idProgrammeNiveau: ProgrammeNiveauId): Promise<ProgrammeNiveau | null> {
    const clauseIsolation = this.construireClauseIsolationLectureParEcole('"id_ecole"', 2);
    const parent = await this.executerRequeteUnique<PersistanceProgrammeNiveauPostgres>(
      `SELECT * FROM programmes_niveau WHERE id = $1 ${clauseIsolation.clauseSql} LIMIT 1`,
      [idProgrammeNiveau.obtenirValeur(), ...clauseIsolation.parametres],
    );

    if (parent === null) {
      return null;
    }

    const lignes = await this.chargerLignes(parent.id);

    return this.marquerAgregatCharge(
      MapperProgrammeNiveauPostgres.depuisPersistance(parent, lignes),
    );
  }

  // Cette methode retrouve le programme niveau valide pour une ecole, une annee et une classe.
  public async trouverValideParContexte(
    idEcole: EcoleId,
    idAnneeScolaire: AnneeScolaireId,
    idClasseAcademique: ClasseAcademiqueId,
  ): Promise<ProgrammeNiveau | null> {
    const clauseIsolation = this.construireClauseIsolationLectureParEcole('"id_ecole"', 4);
    const parent = await this.executerRequeteUnique<PersistanceProgrammeNiveauPostgres>(
      [
        'SELECT * FROM programmes_niveau',
        `WHERE id_ecole = $1 AND id_annee_scolaire = $2 AND id_classe_academique = $3 ${clauseIsolation.clauseSql}`,
        "AND statut = 'VALIDE'",
        'LIMIT 1',
      ].join(' '),
      [
        idEcole.obtenirValeur(),
        idAnneeScolaire.obtenirValeur(),
        idClasseAcademique.obtenirValeur(),
        ...clauseIsolation.parametres,
      ],
    );

    if (parent === null) {
      return null;
    }

    const lignes = await this.chargerLignes(parent.id);

    return this.marquerAgregatCharge(
      MapperProgrammeNiveauPostgres.depuisPersistance(parent, lignes),
    );
  }

  // Cette methode liste les programmes niveau d'une ecole pour une annee donnee.
  public async listerParEcoleEtAnnee(
    idEcole: EcoleId,
    idAnneeScolaire: AnneeScolaireId,
    pagination: Pagination,
  ): Promise<ResultatPagine<ProgrammeNiveau>> {
    const idEcoleValeur = idEcole.obtenirValeur();
    const idAnneeValeur = idAnneeScolaire.obtenirValeur();
    const clauseIsolation = this.construireClauseIsolationLectureParEcole('"id_ecole"', 3);

    return this.executerLecturePaginee<PersistanceProgrammeNiveauPostgres, ProgrammeNiveau>(
      `SELECT COUNT(*) AS total FROM programmes_niveau WHERE id_ecole = $1 AND id_annee_scolaire = $2 ${clauseIsolation.clauseSql}`,
      [idEcoleValeur, idAnneeValeur, ...clauseIsolation.parametres],
      [
        'SELECT * FROM programmes_niveau',
        `WHERE id_ecole = $1 AND id_annee_scolaire = $2 ${clauseIsolation.clauseSql}`,
        'ORDER BY cree_le DESC, id ASC',
      ].join(' '),
      [idEcoleValeur, idAnneeValeur, ...clauseIsolation.parametres],
      pagination,
      async (ligne) => {
        const lignes = await this.chargerLignes(ligne.id);

        return this.marquerAgregatCharge(
          MapperProgrammeNiveauPostgres.depuisPersistance(ligne, lignes),
        );
      },
    );
  }

  // Cette methode persiste l'etat courant d'un programme niveau.
  public async sauvegarder(programmeNiveau: ProgrammeNiveau): Promise<void> {
    const parent = MapperProgrammeNiveauPostgres.versPersistance(programmeNiveau);
    const lignes = MapperProgrammeNiveauPostgres.versLignesPersistance(programmeNiveau);
    const colonnesParent = [
      'id',
      'id_ecole',
      'id_annee_scolaire',
      'id_classe_academique',
      'id_referentiel_programme',
      'id_version_referentiel_programme',
      'statut',
      'cree_le',
      'cree_par',
      'valide_le',
      'valide_par',
      'archive_le',
      'version',
    ] as const;
    const colonnesLigne = [
      'id',
      'id_programme_niveau',
      'id_referentiel_cours',
      'ordre_affichage',
      'obligatoire',
      'a_examen',
      'est_actif_dans_ecole',
      'est_calculable',
      'obsolete',
      'source_ligne',
      'ponderation',
    ] as const;

    this.verifierEcritureLocaleAutorisee(programmeNiveau.obtenirEcoleId().obtenirValeur());

    await this.sauvegarderAgregatVersionne(
      programmeNiveau,
      'programmes_niveau',
      'id',
      programmeNiveau.obtenirId().obtenirValeur(),
      colonnesParent,
      this.extraireValeurs(parent, colonnesParent),
    );

    await this.remplacerCollectionEnfants(
      'lignes_programme_niveau',
      'id_programme_niveau',
      parent.id,
      colonnesLigne,
      lignes,
      (ligne) => this.extraireValeurs(ligne, colonnesLigne),
    );
  }

  private async chargerLignes(
    idProgrammeNiveau: string,
  ): Promise<readonly PersistanceLigneProgrammeNiveauPostgres[]> {
    return this.executerRequete<PersistanceLigneProgrammeNiveauPostgres>(
      [
        'SELECT * FROM lignes_programme_niveau',
        'WHERE id_programme_niveau = $1',
        'ORDER BY ordre_affichage ASC, id ASC',
      ].join(' '),
      [idProgrammeNiveau],
    );
  }
}
