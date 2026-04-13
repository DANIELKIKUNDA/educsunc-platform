import { randomUUID } from 'node:crypto';

import { InfrastructureError } from '../../../../shared/exceptions/InfrastructureError';
import {
  EntreeJournalAuditReferentielAcademique,
  ServiceJournalAuditReferentielAcademique,
} from '../../application/services/ServiceJournalAuditReferentielAcademique';
import { ClientPostgresReferentielAcademique } from '../persistence/postgres/depots/ClientPostgresReferentielAcademique';
import { PostgresUnitOfWork } from '../persistence/postgres/transaction/PostgresUnitOfWork';
import { ContexteExecutionTenantReferentielAcademique } from '../tenancy/ContexteExecutionTenantReferentielAcademique';

interface EntreeJournalAuditReferentielAcademiqueNormalisee {
  action: string;
  acteur?: string;
  typeRessource?: string;
  idRessource?: string;
  idEcole?: string;
  idOrganisation?: string;
  details?: Readonly<Record<string, unknown>>;
  creeLe: Date;
}

// Ce writer persiste les entrees d'audit du BC dans la table technique PostgreSQL.
export class ServiceJournalAuditReferentielAcademiquePostgres
  implements ServiceJournalAuditReferentielAcademique
{
  private readonly clientLecture: ClientPostgresReferentielAcademique;
  private readonly uniteDeTravail?: PostgresUnitOfWork<ClientPostgresReferentielAcademique>;
  private readonly contexteExecutionTenant?: ContexteExecutionTenantReferentielAcademique;

  // Ce constructeur injecte le client, la transaction courante et le contexte tenant.
  constructor(
    clientLecture: ClientPostgresReferentielAcademique,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresReferentielAcademique>,
    contexteExecutionTenant?: ContexteExecutionTenantReferentielAcademique,
  ) {
    this.clientLecture = clientLecture;
    this.uniteDeTravail = uniteDeTravail;
    this.contexteExecutionTenant = contexteExecutionTenant;
  }

  // Cette methode insere une entree d'audit exploitable et enrichie du contexte courant.
  public async journaliser(
    entree: EntreeJournalAuditReferentielAcademique,
  ): Promise<void> {
    const entreeNormalisee = this.normaliserEntree(entree);
    const clientActif = this.uniteDeTravail?.obtenirContexteTransactionCourant()?.clientTransactionnel
      ?? this.clientLecture;

    try {
      await clientActif.executer(
        [
          'INSERT INTO "audit_logs" (',
          '"id",',
          '"action",',
          '"acteur",',
          '"type_ressource",',
          '"id_ressource",',
          '"id_ecole",',
          '"id_organisation",',
          '"details",',
          '"cree_le"',
          ') VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        ].join(' '),
        [
          this.genererIdentifiantAudit(),
          entreeNormalisee.action,
          entreeNormalisee.acteur,
          entreeNormalisee.typeRessource,
          entreeNormalisee.idRessource,
          entreeNormalisee.idEcole,
          entreeNormalisee.idOrganisation,
          entreeNormalisee.details,
          entreeNormalisee.creeLe,
        ],
      );
    } catch (erreur) {
      throw new InfrastructureError(
        "La journalisation d'audit du referentiel academique a echoue.",
        'ECRITURE_AUDIT_REFERENTIEL_ACADEMIQUE',
        {
          action: entreeNormalisee.action,
          idRessource: entreeNormalisee.idRessource,
          messageErreur: this.decrireErreur(erreur),
        },
      );
    }
  }

  // Cette methode complete les informations manquantes a partir du contexte courant.
  private normaliserEntree(
    entree: EntreeJournalAuditReferentielAcademique,
  ): EntreeJournalAuditReferentielAcademiqueNormalisee {
    const etatTenantCourant = this.contexteExecutionTenant?.obtenirEtatCourant();
    const action = entree.action.trim();

    if (action.length === 0) {
      throw new InfrastructureError(
        "Une entree d'audit exige une action explicite.",
        'ENTREE_AUDIT_REFERENTIEL_ACADEMIQUE_INVALIDE',
      );
    }

    return {
      action,
      acteur: entree.acteur?.trim() || undefined,
      typeRessource: entree.typeRessource?.trim() || undefined,
      idRessource: entree.idRessource?.trim() || undefined,
      idEcole: entree.idEcole?.trim() || etatTenantCourant?.idTenant || undefined,
      idOrganisation:
        entree.idOrganisation?.trim() || etatTenantCourant?.idOrganisation || undefined,
      details: entree.details,
      creeLe: entree.creeLe instanceof Date && !Number.isNaN(entree.creeLe.getTime())
        ? new Date(entree.creeLe.getTime())
        : new Date(),
    };
  }

  // Cette methode genere un identifiant technique compatible avec les colonnes PostgreSQL de type uuid.
  private genererIdentifiantAudit(): string {
    return randomUUID();
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
