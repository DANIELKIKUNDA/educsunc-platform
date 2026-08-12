import { InfrastructureError } from '../../../../shared/exceptions/InfrastructureError';
import { AuditCanonicalWriteService } from '../../../../shared/audit/application/services';
import { AuditCanonicalEventMapper } from '../../../../shared/audit/infrastructure/outbox';
import { PostgresAuditCanonicalStorage } from '../../../../shared/audit/infrastructure/persistence/postgres/repositories';
import {
  CanonicalAuditProducer,
  type CanonicalAuditProducerInput,
} from '../../../../shared/audit/infrastructure/producers';
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

// Ce writer raccorde les nouvelles traces du BC au registre canonique et laisse audit_logs en historique.
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

  // Cette methode produit une entree canonique enrichie du contexte courant.
  public async journaliser(
    entree: EntreeJournalAuditReferentielAcademique,
  ): Promise<void> {
    const entreeNormalisee = this.normaliserEntree(entree);
    const clientActif = this.uniteDeTravail?.obtenirContexteTransactionCourant()?.clientTransactionnel
      ?? this.clientLecture;

    try {
      const producteur = new CanonicalAuditProducer(new AuditCanonicalWriteService(
        new PostgresAuditCanonicalStorage(clientActif),
        new AuditCanonicalEventMapper(),
      ));
      const action = /PONDERATION/i.test(entreeNormalisee.action)
        ? 'PONDERATION_MODIFIEE'
        : 'REFERENTIEL_MODIFIE';
      await producteur.produire({
        action,
        resultat: 'SUCCESS',
        acteur: { id: entreeNormalisee.acteur },
        tenant: this.mapperTenant(entreeNormalisee),
        ressource: {
          type: this.mapperTypeRessource(entreeNormalisee.typeRessource),
          id: entreeNormalisee.idRessource,
          libelle: entreeNormalisee.action,
        },
        contexte: {
          requestId: this.texte(entreeNormalisee.details?.requestId),
          correlationId: this.texte(entreeNormalisee.details?.correlationId)
            ?? entreeNormalisee.idRessource,
          source: /MIGRATION/i.test(entreeNormalisee.action) ? 'MIGRATION' : 'HTTP_API',
        },
        nouvelEtat: entreeNormalisee.details,
        metadata: { ...entreeNormalisee.details, actionSource: entreeNormalisee.action },
        idempotencyKey: [
          'REFERENTIEL',
          action,
          entreeNormalisee.action,
          entreeNormalisee.idRessource ?? 'SANS_ID',
          entreeNormalisee.creeLe.toISOString(),
        ].join(':'),
        occurredAt: entreeNormalisee.creeLe,
      });
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

  private mapperTenant(
    entree: EntreeJournalAuditReferentielAcademiqueNormalisee,
  ): CanonicalAuditProducerInput['tenant'] {
    if (entree.idOrganisation && entree.idEcole) {
      return { scope: 'ECOLE', organisationId: entree.idOrganisation, ecoleId: entree.idEcole };
    }
    if (entree.idOrganisation) return { scope: 'ORGANISATION', organisationId: entree.idOrganisation };
    return { scope: 'PLATEFORME' };
  }

  private mapperTypeRessource(
    typeRessource?: string,
  ): CanonicalAuditProducerInput['ressource']['type'] {
    const type = typeRessource?.toUpperCase();
    if (type === 'ORGANISATION') return 'ORGANISATION';
    if (type === 'ECOLE') return 'ECOLE';
    if (type?.includes('CLASSE')) return 'CLASSE';
    if (type?.includes('COURS')) return 'COURS';
    return 'REFERENTIEL';
  }

  private texte(valeur: unknown): string | undefined {
    return typeof valeur === 'string' && valeur.trim() ? valeur.trim() : undefined;
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
