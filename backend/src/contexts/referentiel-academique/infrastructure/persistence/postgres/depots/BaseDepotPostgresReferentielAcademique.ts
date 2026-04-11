import { Pagination, ResultatPagine } from '../../../../../../shared/application/Pagination';
import { InfrastructureError } from '../../../../../../shared/exceptions/InfrastructureError';
import { ValidationError } from '../../../../../../shared/exceptions/ValidationError';
import { ContexteExecutionTenantReferentielAcademique } from '../../../tenancy/ContexteExecutionTenantReferentielAcademique';
import { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import { ClientPostgresReferentielAcademique } from './ClientPostgresReferentielAcademique';

interface LigneComptagePostgres {
  total: number | string;
}

interface ClausePaginationSql {
  sql: string;
  parametres: readonly [number, number];
}

// Cette classe centralise les utilitaires communs de persistance PostgreSQL du BC.
export abstract class BaseDepotPostgresReferentielAcademique {
  private readonly clientLecture: ClientPostgresReferentielAcademique;
  private readonly uniteDeTravail?: PostgresUnitOfWork<ClientPostgresReferentielAcademique>;
  private readonly contexteExecutionTenant?: ContexteExecutionTenantReferentielAcademique;
  private readonly versionsChargees = new WeakMap<object, number>();

  // Ce constructeur injecte le client de lecture et, si besoin, l'unite de travail transactionnelle.
  constructor(
    clientLecture: ClientPostgresReferentielAcademique,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresReferentielAcademique>,
    contexteExecutionTenant?: ContexteExecutionTenantReferentielAcademique,
  ) {
    this.clientLecture = clientLecture;
    this.uniteDeTravail = uniteDeTravail;
    this.contexteExecutionTenant = contexteExecutionTenant;
  }

  // Cette methode retourne le client actif, transactionnel ou non, pour la requete en cours.
  protected obtenirClientActif(): ClientPostgresReferentielAcademique {
    const contexteTransaction = this.uniteDeTravail?.obtenirContexteTransactionCourant();

    return contexteTransaction?.clientTransactionnel ?? this.clientLecture;
  }

  // Cette methode execute une lecture SQL et encapsule les erreurs techniques.
  protected async executerRequete<TLigne extends object>(
    requeteSql: string,
    parametres: readonly unknown[] = [],
  ): Promise<readonly TLigne[]> {
    try {
      const resultat = await this.obtenirClientActif().executer<TLigne>(requeteSql, parametres);

      return resultat.lignes;
    } catch (erreur) {
      throw this.creerErreurInfrastructure(
        'La lecture PostgreSQL du referentiel academique a echoue.',
        requeteSql,
        parametres,
        erreur,
      );
    }
  }

  // Cette methode execute une commande SQL et retourne le nombre de lignes affectees.
  protected async executerCommande(
    requeteSql: string,
    parametres: readonly unknown[] = [],
  ): Promise<number> {
    try {
      const resultat = await this.obtenirClientActif().executer(requeteSql, parametres);

      return resultat.nombreLignesAffectees;
    } catch (erreur) {
      throw this.creerErreurInfrastructure(
        'La commande PostgreSQL du referentiel academique a echoue.',
        requeteSql,
        parametres,
        erreur,
      );
    }
  }

  // Cette methode execute une lecture SQL en ne gardant qu'une seule ligne si elle existe.
  protected async executerRequeteUnique<TLigne extends object>(
    requeteSql: string,
    parametres: readonly unknown[] = [],
  ): Promise<TLigne | null> {
    const lignes = await this.executerRequete<TLigne>(requeteSql, parametres);

    return lignes[0] ?? null;
  }

  // Cette methode retourne le contexte tenant d'execution lorsqu'il est disponible.
  protected obtenirContexteExecutionTenant():
    ContexteExecutionTenantReferentielAcademique | undefined {
    return this.contexteExecutionTenant;
  }

  // Cette methode exige un tenant courant pour toute lecture ou ecriture locale.
  protected exigerTenantCourant(): string {
    const contexteTenant = this.contexteExecutionTenant?.obtenirEtatCourant();

    if (contexteTenant === undefined || contexteTenant.idTenant === null) {
      throw new InfrastructureError(
        'Une operation locale du referentiel academique exige un tenant courant explicite.',
        'TENANT_REFERENTIEL_ACADEMIQUE_REQUIS',
      );
    }

    return contexteTenant.idTenant;
  }

  // Cette methode retourne l'identifiant d'organisation du contexte courant si il existe.
  protected obtenirOrganisationCourante(): string | null {
    return this.contexteExecutionTenant?.obtenirEtatCourant().idOrganisation ?? null;
  }

  // Cette methode indique si le contexte courant opere en lecture organisationnelle.
  protected estEnLectureOrganisationnelle(): boolean {
    return this.contexteExecutionTenant?.obtenirEtatCourant().lectureOrganisationnelle ?? false;
  }

  // Cette methode construit la clause SQL de lecture isolee par ecole.
  protected construireClauseIsolationLectureParEcole(
    expressionIdEcole: string,
    indexPremierParametre: number,
  ): { clauseSql: string; parametres: readonly unknown[] } {
    const contexteTenant = this.contexteExecutionTenant?.obtenirEtatCourant();

    if (contexteTenant === undefined) {
      throw new InfrastructureError(
        "Le depot local ne dispose pas d'un contexte tenant d'execution.",
        'CONTEXTE_TENANT_REFERENTIEL_ACADEMIQUE_ABSENT',
      );
    }

    if (!contexteTenant.lectureOrganisationnelle) {
      if (contexteTenant.idTenant === null) {
        throw new InfrastructureError(
          'Une operation locale du referentiel academique exige un tenant courant explicite.',
          'TENANT_REFERENTIEL_ACADEMIQUE_REQUIS',
        );
      }

      return {
        clauseSql: `AND ${expressionIdEcole} = $${indexPremierParametre}`,
        parametres: [contexteTenant.idTenant],
      };
    }

    if (contexteTenant.idOrganisation === null) {
      throw new InfrastructureError(
        "Une lecture organisationnelle exige un identifiant d'organisation courant.",
        'LECTURE_ORGANISATIONNELLE_INVALIDE',
      );
    }

    return {
      clauseSql: [
        'AND EXISTS (',
        'SELECT 1 FROM "ecoles" "tenant_ecole"',
        `WHERE "tenant_ecole"."id" = ${expressionIdEcole}`,
        `AND "tenant_ecole"."id_organisation" = $${indexPremierParametre}`,
        ')',
      ].join(' '),
      parametres: [contexteTenant.idOrganisation],
    };
  }

  // Cette methode verifie qu'une ecriture locale cible bien le tenant courant.
  protected verifierEcritureLocaleAutorisee(idEcole: string): void {
    const idTenant = this.exigerTenantCourant();

    if (this.estEnLectureOrganisationnelle()) {
      throw new InfrastructureError(
        "Une lecture organisationnelle ne peut jamais etre reutilisee pour une ecriture locale.",
        'ECRITURE_LOCALE_INTERDITE_EN_LECTURE_ORGANISATIONNELLE',
        {
          idEcole,
          idTenant,
        },
      );
    }

    if (idEcole.trim() !== idTenant.trim()) {
      throw new InfrastructureError(
        "Une ecriture locale ne peut pas cibler une autre ecole que le tenant courant.",
        'ECRITURE_LOCALE_HORS_TENANT',
        {
          idEcole,
          idTenant,
        },
      );
    }
  }

  // Cette methode construit un resultat pagine a partir d'une requete de comptage et d'une requete de lecture.
  protected async executerLecturePaginee<TLigne extends object, TElement>(
    requeteComptage: string,
    parametresComptage: readonly unknown[],
    requeteLecture: string,
    parametresLecture: readonly unknown[],
    pagination: Pagination,
    mappeur: (ligne: TLigne) => Promise<TElement> | TElement,
  ): Promise<ResultatPagine<TElement>> {
    const paginationNormalisee = this.normaliserPagination(pagination);
    const ligneComptage = await this.executerRequeteUnique<LigneComptagePostgres>(
      requeteComptage,
      parametresComptage,
    );
    const total = ligneComptage === null
      ? 0
      : this.convertirVersEntier(ligneComptage.total, 'total');
    const clausePagination = this.construireClausePagination(
      paginationNormalisee,
      parametresLecture.length + 1,
    );
    const lignes = await this.executerRequete<TLigne>(
      `${requeteLecture} ${clausePagination.sql}`,
      [...parametresLecture, ...clausePagination.parametres],
    );

    return {
      donnees: await Promise.all(lignes.map((ligne) => mappeur(ligne))),
      total,
      page: paginationNormalisee.page,
      taillePage: paginationNormalisee.taillePage,
    };
  }

  // Cette methode fabrique une instruction d'upsert simple pour une table donnee.
  protected construireInstructionUpsert(
    nomTable: string,
    colonnes: readonly string[],
    colonnesConflit: readonly string[],
    colonnesSansMiseAJour: readonly string[] = [],
  ): string {
    const tableProtegee = this.protegerIdentifiantSql(nomTable);
    const colonnesProtegees = colonnes.map((colonne) => this.protegerIdentifiantSql(colonne));
    const colonnesConflitProtegees = colonnesConflit.map((colonne) => this.protegerIdentifiantSql(colonne));
    const valeursSql = colonnes.map((_, index) => `$${index + 1}`).join(', ');
    const colonnesMisesAJour = colonnes.filter((colonne) => (
      !colonnesConflit.includes(colonne) && !colonnesSansMiseAJour.includes(colonne)
    ));

    if (colonnesMisesAJour.length === 0) {
      return [
        `INSERT INTO ${tableProtegee} (${colonnesProtegees.join(', ')})`,
        `VALUES (${valeursSql})`,
        `ON CONFLICT (${colonnesConflitProtegees.join(', ')}) DO NOTHING`,
      ].join(' ');
    }

    const clauseMiseAJour = colonnesMisesAJour
      .map((colonne) => {
        const colonneProtegee = this.protegerIdentifiantSql(colonne);

        return `${colonneProtegee} = EXCLUDED.${colonneProtegee}`;
      })
      .join(', ');

    return [
      `INSERT INTO ${tableProtegee} (${colonnesProtegees.join(', ')})`,
      `VALUES (${valeursSql})`,
      `ON CONFLICT (${colonnesConflitProtegees.join(', ')}) DO UPDATE SET ${clauseMiseAJour}`,
    ].join(' ');
  }

  // Cette methode extrait les valeurs d'un enregistrement dans l'ordre des colonnes choisies.
  protected extraireValeurs<
    TEnregistrement extends object,
    TCle extends keyof TEnregistrement,
  >(
    enregistrement: TEnregistrement,
    colonnes: readonly TCle[],
  ): readonly unknown[] {
    const enregistrementIndexe = enregistrement as Record<PropertyKey, unknown>;

    return colonnes.map((colonne) => enregistrementIndexe[colonne]);
  }

  // Cette methode marque un agregat comme charge depuis la persistence pour activer le verrouillage optimiste.
  protected marquerAgregatCharge<
    TAgregat extends object & { obtenirVersion(): number },
  >(agregat: TAgregat): TAgregat {
    this.versionsChargees.set(agregat, agregat.obtenirVersion());

    return agregat;
  }

  // Cette methode sauvegarde un agregat versionne en imposant un controle optimiste sur son numero de version.
  protected async sauvegarderAgregatVersionne<
    TAgregat extends object & { obtenirVersion(): number },
  >(
    agregat: TAgregat,
    nomTable: string,
    colonneIdentifiant: string,
    identifiant: string,
    colonnes: readonly string[],
    valeurs: readonly unknown[],
  ): Promise<void> {
    const versionPersistante = await this.obtenirVersionPersistante(
      agregat,
      nomTable,
      colonneIdentifiant,
      identifiant,
    );
    const versionActuelle = agregat.obtenirVersion();

    if (versionPersistante === null) {
      await this.executerCommande(
        this.construireInstructionInsertion(nomTable, colonnes),
        valeurs,
      );
      this.versionsChargees.set(agregat, versionActuelle);
      return;
    }

    if (!Number.isInteger(versionActuelle) || versionActuelle <= 0) {
      throw new InfrastructureError(
        "La version actuelle de l'agregat a sauvegarder est invalide.",
        'VERSION_AGREGAT_A_SAUVEGARDER_INVALIDE',
        {
          nomTable,
          identifiant,
          versionActuelle,
        },
      );
    }

    if (versionActuelle < versionPersistante) {
      throw this.creerErreurConflitOptimiste(nomTable, identifiant, versionPersistante, versionActuelle);
    }

    const colonnesMisesAJour = colonnes.filter((colonne) => colonne !== colonneIdentifiant);
    const affectationsSql = colonnesMisesAJour
      .map((colonne, index) => `${this.protegerIdentifiantSql(colonne)} = $${index + 1}`)
      .join(', ');
    const indexIdentifiant = colonnesMisesAJour.length + 1;
    const indexVersionAttendues = colonnesMisesAJour.length + 2;
    const valeursMiseAJour = colonnesMisesAJour.map((colonne) => {
      const indexColonne = colonnes.indexOf(colonne);

      return valeurs[indexColonne];
    });
    const nombreLignesAffectees = await this.executerCommande(
      [
        `UPDATE ${this.protegerIdentifiantSql(nomTable)}`,
        `SET ${affectationsSql}`,
        `WHERE ${this.protegerIdentifiantSql(colonneIdentifiant)} = $${indexIdentifiant}`,
        `AND ${this.protegerIdentifiantSql('version')} = $${indexVersionAttendues}`,
      ].join(' '),
      [
        ...valeursMiseAJour,
        identifiant,
        versionPersistante,
      ],
    );

    if (nombreLignesAffectees === 0) {
      throw this.creerErreurConflitOptimiste(nomTable, identifiant, versionPersistante, versionActuelle);
    }

    this.versionsChargees.set(agregat, versionActuelle);
  }

  // Cette methode remplace integralement une collection d'enfants rattachee a un parent.
  protected async remplacerCollectionEnfants<TElement>(
    nomTable: string,
    colonneParent: string,
    idParent: string,
    colonnes: readonly string[],
    elements: readonly TElement[],
    extraireValeurs: (element: TElement) => readonly unknown[],
  ): Promise<void> {
    const tableProtegee = this.protegerIdentifiantSql(nomTable);
    const colonneParentProtegee = this.protegerIdentifiantSql(colonneParent);

    await this.executerCommande(
      `DELETE FROM ${tableProtegee} WHERE ${colonneParentProtegee} = $1`,
      [idParent],
    );

    if (elements.length === 0) {
      return;
    }

    const colonnesProtegees = colonnes.map((colonne) => this.protegerIdentifiantSql(colonne));

    for (const element of elements) {
      const valeurs = extraireValeurs(element);
      const valeursSql = valeurs.map((_, index) => `$${index + 1}`).join(', ');

      await this.executerCommande(
        `INSERT INTO ${tableProtegee} (${colonnesProtegees.join(', ')}) VALUES (${valeursSql})`,
        valeurs,
      );
    }
  }

  // Cette methode fabrique une instruction d'insertion stricte sans upsert.
  protected construireInstructionInsertion(
    nomTable: string,
    colonnes: readonly string[],
  ): string {
    const tableProtegee = this.protegerIdentifiantSql(nomTable);
    const colonnesProtegees = colonnes.map((colonne) => this.protegerIdentifiantSql(colonne));
    const valeursSql = colonnes.map((_, index) => `$${index + 1}`).join(', ');

    return [
      `INSERT INTO ${tableProtegee} (${colonnesProtegees.join(', ')})`,
      `VALUES (${valeursSql})`,
    ].join(' ');
  }

  // Cette methode normalise et valide une pagination applicative.
  protected normaliserPagination(pagination: Pagination): Pagination {
    if (!Number.isInteger(pagination.page) || pagination.page <= 0) {
      throw new ValidationError(
        'Le numero de page doit etre un entier strictement positif.',
        'PAGINATION_PAGE_INVALIDE',
      );
    }

    if (!Number.isInteger(pagination.taillePage) || pagination.taillePage <= 0) {
      throw new ValidationError(
        'La taille de page doit etre un entier strictement positif.',
        'PAGINATION_TAILLE_INVALIDE',
      );
    }

    return {
      page: pagination.page,
      taillePage: pagination.taillePage,
    };
  }

  // Cette methode construit la clause SQL LIMIT/OFFSET correspondant a une pagination validee.
  protected construireClausePagination(
    pagination: Pagination,
    indexPremierParametre: number,
  ): ClausePaginationSql {
    return {
      sql: `LIMIT $${indexPremierParametre} OFFSET $${indexPremierParametre + 1}`,
      parametres: [
        pagination.taillePage,
        (pagination.page - 1) * pagination.taillePage,
      ],
    };
  }

  // Cette methode convertit une valeur PostgreSQL numerique vers un entier TypeScript.
  protected convertirVersEntier(valeur: unknown, nomChamp: string): number {
    if (typeof valeur === 'number' && Number.isInteger(valeur)) {
      return valeur;
    }

    if (typeof valeur === 'string' && valeur.trim().length > 0) {
      const valeurConvertie = Number.parseInt(valeur, 10);

      if (Number.isInteger(valeurConvertie)) {
        return valeurConvertie;
      }
    }

    throw new InfrastructureError(
      `La valeur du champ "${nomChamp}" n'est pas un entier PostgreSQL exploitable.`,
      'LECTURE_ENTIER_POSTGRES_INVALIDE',
      {
        nomChamp,
        valeur,
      },
    );
  }

  // Cette methode protege un identifiant SQL construit dynamiquement.
  protected protegerIdentifiantSql(identifiant: string): string {
    if (!/^[a-z_][a-z0-9_]*$/i.test(identifiant)) {
      throw new ValidationError(
        `L'identifiant SQL "${identifiant}" est invalide.`,
        'IDENTIFIANT_SQL_INVALIDE',
      );
    }

    return `"${identifiant}"`;
  }

  // Cette methode construit une erreur d'infrastructure coherente pour les depots PostgreSQL.
  private creerErreurInfrastructure(
    message: string,
    requeteSql: string,
    parametres: readonly unknown[],
    erreur: unknown,
  ): InfrastructureError {
    return new InfrastructureError(
      message,
      'DEPOT_POSTGRES_REFERENTIEL_ACADEMIQUE',
      {
        requeteSql,
        parametres,
        messageErreur: this.decrireErreur(erreur),
      },
    );
  }

  // Cette methode retrouve la version persistante d'un agregat deja connu ou deja stocke.
  private async obtenirVersionPersistante<TAgregat extends object>(
    agregat: TAgregat,
    nomTable: string,
    colonneIdentifiant: string,
    identifiant: string,
  ): Promise<number | null> {
    const versionChargee = this.versionsChargees.get(agregat);

    if (versionChargee !== undefined) {
      return versionChargee;
    }

    const ligneVersion = await this.executerRequeteUnique<{ version: number | string }>(
      [
        `SELECT ${this.protegerIdentifiantSql('version')} AS ${this.protegerIdentifiantSql('version')}`,
        `FROM ${this.protegerIdentifiantSql(nomTable)}`,
        `WHERE ${this.protegerIdentifiantSql(colonneIdentifiant)} = $1`,
        'LIMIT 1',
      ].join(' '),
      [identifiant],
    );

    if (ligneVersion === null) {
      return null;
    }

    return this.convertirVersEntier(ligneVersion.version, 'version');
  }

  // Cette methode construit une erreur coherente de concurrence optimiste.
  private creerErreurConflitOptimiste(
    nomTable: string,
    identifiant: string,
    versionPersistante: number,
    versionDemandee: number,
  ): InfrastructureError {
    return new InfrastructureError(
      "La sauvegarde a ete refusee car l'agregat a ete modifie concurremment.",
      'CONFLIT_OPTIMISTE_REFERENTIEL_ACADEMIQUE',
      {
        nomTable,
        identifiant,
        versionPersistante,
        versionDemandee,
      },
    );
  }

  // Cette methode produit une description robuste d'une erreur inconnue.
  private decrireErreur(erreur: unknown): string {
    if (erreur instanceof Error) {
      return erreur.message;
    }

    if (typeof erreur === 'string') {
      return erreur;
    }

    try {
      return JSON.stringify(erreur);
    } catch {
      return 'Erreur inconnue';
    }
  }
}
