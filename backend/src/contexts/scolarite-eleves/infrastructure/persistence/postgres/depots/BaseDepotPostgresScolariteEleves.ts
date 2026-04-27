import { InfrastructureError } from '../../../../../../shared/exceptions/InfrastructureError';
import { ScolariteTenantContext } from '../../../tenancy/ScolariteTenantContext';
import { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import { ClientPostgresScolariteEleves } from './ClientPostgresScolariteEleves';

// Ce fichier centralise les operations PostgreSQL communes aux depots du BC.
/**
 * Cette classe fournit execution SQL, isolation tenant et upsert generique sans logique metier.
 */
export abstract class BaseDepotPostgresScolariteEleves {
  constructor(
    private readonly clientLecture: ClientPostgresScolariteEleves,
    private readonly uniteDeTravail?: PostgresUnitOfWork<ClientPostgresScolariteEleves>,
    private readonly tenantContext?: ScolariteTenantContext,
  ) {}

  /** Retourne le client actif, transactionnel si une transaction est ouverte. */
  protected obtenirClientActif(): ClientPostgresScolariteEleves {
    return this.uniteDeTravail?.obtenirContexteTransactionCourant()?.clientTransactionnel ?? this.clientLecture;
  }

  /** Execute une requete de lecture SQL. */
  protected async executerRequete<TLigne extends object>(requeteSql: string, parametres: readonly unknown[] = []): Promise<readonly TLigne[]> {
    try {
      return (await this.obtenirClientActif().executer<TLigne>(requeteSql, parametres)).lignes;
    } catch (erreur) {
      throw this.creerErreurInfrastructure('Lecture PostgreSQL scolarite eleves echouee.', requeteSql, parametres, erreur);
    }
  }

  /** Execute une requete de lecture qui retourne au plus une ligne. */
  protected async executerRequeteUnique<TLigne extends object>(requeteSql: string, parametres: readonly unknown[] = []): Promise<TLigne | null> {
    return (await this.executerRequete<TLigne>(requeteSql, parametres))[0] ?? null;
  }

  /** Execute une commande SQL et retourne le nombre de lignes affectees. */
  protected async executerCommande(requeteSql: string, parametres: readonly unknown[] = []): Promise<number> {
    try {
      return (await this.obtenirClientActif().executer(requeteSql, parametres)).nombreLignesAffectees;
    } catch (erreur) {
      throw this.creerErreurInfrastructure('Commande PostgreSQL scolarite eleves echouee.', requeteSql, parametres, erreur);
    }
  }

  /** Verifie que l'ecriture cible l'ecole du tenant courant quand un tenant est fourni. */
  protected verifierEcritureTenant(idOrganisation: string, idEcole: string): void {
    this.tenantContext?.verifierEcritureAutorisee(idOrganisation, idEcole);
  }

  /** Construit une clause SQL d'isolation tenant pour les lectures locales. */
  protected construireClauseTenant(aliasTable: string, indexOrganisation: number, indexEcole: number): { sql: string; parametres: readonly unknown[] } {
    if (this.tenantContext === undefined) {
      return { sql: '', parametres: [] };
    }

    const etat = this.tenantContext.obtenirEtatCourant();

    if (etat.lectureOrganisationnelle) {
      return {
        sql: `AND ${aliasTable}.id_organisation = $${indexOrganisation}`,
        parametres: [etat.idOrganisation],
      };
    }

    return {
      sql: `AND ${aliasTable}.id_organisation = $${indexOrganisation} AND ${aliasTable}.id_ecole = $${indexEcole}`,
      parametres: [etat.idOrganisation, etat.idEcole],
    };
  }

  /** Construit une erreur infrastructure avec contexte SQL limite. */
  private creerErreurInfrastructure(message: string, requeteSql: string, parametres: readonly unknown[], erreur: unknown): InfrastructureError {
    return new InfrastructureError(message, 'POSTGRES_SCOLARITE_ELEVES_ERREUR', {
      requeteSql,
      nombreParametres: parametres.length,
      cause: erreur instanceof Error ? erreur.message : String(erreur),
    });
  }
}
