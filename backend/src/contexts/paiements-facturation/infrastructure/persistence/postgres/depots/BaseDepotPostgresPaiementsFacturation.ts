import { InfrastructureError } from '../../../../../../shared/exceptions/InfrastructureError';
import { PaiementTenantContext } from '../../../tenancy/PaiementTenantContext';
import { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import type { ClientPostgresPaiementsFacturation } from './ClientPostgresPaiementsFacturation';

// Cette classe regroupe les utilitaires communs des depots PostgreSQL paiements.
export abstract class BaseDepotPostgresPaiementsFacturation {
  private readonly versionsChargees = new WeakMap<object, number>();

  // Ce constructeur injecte le client de lecture, l'unite de travail optionnelle et le contexte tenant.
  constructor(
    private readonly clientLecture: ClientPostgresPaiementsFacturation,
    private readonly uniteDeTravail?: PostgresUnitOfWork<ClientPostgresPaiementsFacturation>,
    private readonly contexteTenant?: PaiementTenantContext,
  ) {}

  // Cette methode retourne le client actif, transactionnel ou non.
  protected obtenirClientActif(): ClientPostgresPaiementsFacturation {
    const contexte = this.uniteDeTravail?.obtenirContexteTransactionCourant();

    return contexte?.clientTransactionnel ?? this.clientLecture;
  }

  // Cette methode execute une requete de lecture SQL.
  protected async executerRequete<TLigne extends object>(
    requeteSql: string,
    parametres: readonly unknown[] = [],
  ): Promise<readonly TLigne[]> {
    try {
      const resultat = await this.obtenirClientActif().executer<TLigne>(
        requeteSql,
        parametres,
      );

      return resultat.lignes;
    } catch (erreur) {
      throw this.creerErreurInfrastructure(
        'La lecture PostgreSQL paiements a echoue.',
        requeteSql,
        parametres,
        erreur,
      );
    }
  }

  // Cette methode execute une commande SQL d'ecriture.
  protected async executerCommande(
    requeteSql: string,
    parametres: readonly unknown[] = [],
  ): Promise<number> {
    try {
      const resultat = await this.obtenirClientActif().executer(
        requeteSql,
        parametres,
      );

      return resultat.nombreLignesAffectees;
    } catch (erreur) {
      throw this.creerErreurInfrastructure(
        'La commande PostgreSQL paiements a echoue.',
        requeteSql,
        parametres,
        erreur,
      );
    }
  }

  // Cette methode lit une seule ligne si elle existe.
  protected async executerRequeteUnique<TLigne extends object>(
    requeteSql: string,
    parametres: readonly unknown[] = [],
  ): Promise<TLigne | null> {
    const lignes = await this.executerRequete<TLigne>(requeteSql, parametres);

    return lignes[0] ?? null;
  }

  // Cette methode exige le tenant courant pour toute ecriture locale.
  protected verifierEcritureLocaleAutorisee(idEcole: string): void {
    this.contexteTenant?.verifierEcritureAutorisee(idEcole);
  }

  // Cette methode memorise la version chargee d'un agregat.
  protected marquerAgregatCharge<TAgregat extends object & { obtenirVersion(): number }>(
    agregat: TAgregat,
  ): TAgregat {
    this.versionsChargees.set(agregat, agregat.obtenirVersion());

    return agregat;
  }

  // Cette methode sauve un agregat versionne avec controle optimiste.
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

    const colonnesMisesAJour = colonnes.filter(
      (colonne) => colonne !== colonneIdentifiant,
    );
    const affectationsSql = colonnesMisesAJour
      .map(
        (colonne, index) =>
          `${this.protegerIdentifiantSql(colonne)} = $${index + 1}`,
      )
      .join(', ');
    const indexIdentifiant = colonnesMisesAJour.length + 1;
    const indexVersionAttendue = colonnesMisesAJour.length + 2;
    const valeursMiseAJour = colonnesMisesAJour.map((colonne) => {
      const indexColonne = colonnes.indexOf(colonne);

      return valeurs[indexColonne];
    });
    const nombreLignesAffectees = await this.executerCommande(
      [
        `UPDATE ${this.protegerIdentifiantSql(nomTable)}`,
        `SET ${affectationsSql}`,
        `WHERE ${this.protegerIdentifiantSql(colonneIdentifiant)} = $${indexIdentifiant}`,
        `AND ${this.protegerIdentifiantSql('version')} = $${indexVersionAttendue}`,
      ].join(' '),
      [...valeursMiseAJour, identifiant, versionPersistante],
    );

    if (nombreLignesAffectees === 0) {
      throw new InfrastructureError(
        "La sauvegarde a ete refusee car l'agregat a ete modifie concurremment.",
        'CONFLIT_OPTIMISTE_PAIEMENTS_FACTURATION',
        {
          nomTable,
          identifiant,
          versionPersistante,
          versionActuelle,
        },
      );
    }

    this.versionsChargees.set(agregat, versionActuelle);
  }

  // Cette methode remplace integralement une collection denfants.
  protected async remplacerCollectionEnfants<TElement>(
    nomTable: string,
    colonneParent: string,
    idParent: string,
    colonnes: readonly string[],
    elements: readonly TElement[],
    extraireValeurs: (element: TElement) => readonly unknown[],
  ): Promise<void> {
    await this.executerCommande(
      `DELETE FROM ${this.protegerIdentifiantSql(nomTable)} WHERE ${this.protegerIdentifiantSql(colonneParent)} = $1`,
      [idParent],
    );

    for (const element of elements) {
      const valeurs = extraireValeurs(element);
      const valeursSql = valeurs.map((_, index) => `$${index + 1}`).join(', ');

      await this.executerCommande(
        `INSERT INTO ${this.protegerIdentifiantSql(nomTable)} (${colonnes
          .map((colonne) => this.protegerIdentifiantSql(colonne))
          .join(', ')}) VALUES (${valeursSql})`,
        valeurs,
      );
    }
  }

  // Cette methode construit une instruction d'insertion simple.
  protected construireInstructionInsertion(
    nomTable: string,
    colonnes: readonly string[],
  ): string {
    return [
      `INSERT INTO ${this.protegerIdentifiantSql(nomTable)}`,
      `(${colonnes.map((colonne) => this.protegerIdentifiantSql(colonne)).join(', ')})`,
      `VALUES (${colonnes.map((_, index) => `$${index + 1}`).join(', ')})`,
    ].join(' ');
  }

  // Cette methode protege un identifiant SQL simple.
  protected protegerIdentifiantSql(identifiant: string): string {
    return `"${identifiant}"`;
  }

  // Cette methode construit une erreur technique uniforme.
  private creerErreurInfrastructure(
    message: string,
    requeteSql: string,
    parametres: readonly unknown[],
    erreur: unknown,
  ): InfrastructureError {
    return new InfrastructureError(
      message,
      'DEPOT_POSTGRES_PAIEMENTS_FACTURATION',
      {
        requeteSql,
        parametres,
        messageErreur:
          erreur instanceof Error ? erreur.message : 'Erreur inconnue',
      },
    );
  }

  // Cette methode retrouve la version persistante actuelle dun agregat.
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

    const ligne = await this.executerRequeteUnique<{ version: number | string }>(
      [
        `SELECT "version"`,
        `FROM ${this.protegerIdentifiantSql(nomTable)}`,
        `WHERE ${this.protegerIdentifiantSql(colonneIdentifiant)} = $1`,
        'LIMIT 1',
      ].join(' '),
      [identifiant],
    );

    if (ligne === null) {
      return null;
    }

    return Number.parseInt(String(ligne.version), 10);
  }
}
