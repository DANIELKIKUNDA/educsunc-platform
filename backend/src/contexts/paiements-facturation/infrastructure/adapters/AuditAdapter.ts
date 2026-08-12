import { createHash } from 'node:crypto';
import type { AuditFinancierInput, AuditPort } from '../../application/ports/AuditPort';
import { AuditEntryPersistenceMapper } from '../../../../shared/audit/infrastructure/persistence/postgres/mappers/AuditEntryPersistenceMapper';
import type {
  AuditCategoryRow,
  AuditEntryRow,
} from '../../../../shared/audit/infrastructure/persistence/postgres/mappers/AuditPersistenceRecords';
import { AuditJsonbMapper } from '../../../../shared/audit/infrastructure/persistence/postgres/mappers/AuditJsonbMapper';
import type { AuditCanonicalWritePort } from '../../../../shared/audit/application/ports/outbound';
import { AuditCanonicalWriteService } from '../../../../shared/audit/application/services';
import {
  PostgresAuditCanonicalStorage,
} from '../../../../shared/audit/infrastructure/persistence/postgres/repositories';
import { AuditCanonicalEventMapper } from '../../../../shared/audit/infrastructure/outbox';
import { AUDIT_ACTION_MATRIX } from '../../../../shared/audit/domain/invariants/AuditActionMatrix';

type ActionAuditFinancierSupportee =
  | 'PAIEMENT_CREE'
  | 'PAIEMENT_ANNULE'
  | 'RECU_GENERE'
  | 'CAISSE_OUVERTE'
  | 'CAISSE_CLOTUREE'
  | 'PARAMETRES_PAIEMENT_CONFIGURES'
  | 'GRILLE_TARIFICATION_CREEE'
  | 'GRILLE_TARIFICATION_MODIFIEE'
  | 'GRILLE_TARIFICATION_DESACTIVEE'
  | 'OBLIGATIONS_GENEREES';

interface DefinitionAuditFinancier {
  actionAudit: ActionAuditFinancierSupportee;
  typePrincipal: string;
  categories: readonly string[];
  gravite: string;
  niveau: string;
  resultat: string;
  typeRessource: 'PAIEMENT' | 'RECU' | 'CAISSE' | 'ECOLE' | 'ELEVE';
  permissionsActives: readonly string[];
}

const DEFINITIONS_AUDIT_FINANCIER: Record<string, DefinitionAuditFinancier> = {
  ENREGISTRER_PAIEMENT: {
    actionAudit: 'PAIEMENT_CREE',
    typePrincipal: 'FINANCIER',
    categories: ['FINANCIER', 'METIER'],
    gravite: 'ELEVEE',
    niveau: 'CRITIQUE',
    resultat: 'SUCCESS',
    typeRessource: 'PAIEMENT',
    permissionsActives: ['paiements.write'],
  },
  ANNULER_PAIEMENT: {
    actionAudit: 'PAIEMENT_ANNULE',
    typePrincipal: 'FINANCIER',
    categories: ['FINANCIER', 'METIER'],
    gravite: 'CRITIQUE',
    niveau: 'CRITIQUE',
    resultat: 'CANCELLED',
    typeRessource: 'PAIEMENT',
    permissionsActives: ['paiements.write'],
  },
  GENERER_RECU_OFFICIEL: {
    actionAudit: 'RECU_GENERE',
    typePrincipal: 'FINANCIER',
    categories: ['FINANCIER'],
    gravite: 'MOYENNE',
    niveau: 'INFORMATION',
    resultat: 'SUCCESS',
    typeRessource: 'RECU',
    permissionsActives: ['paiements.write'],
  },
  OUVRIR_CAISSE_JOUR: {
    actionAudit: 'CAISSE_OUVERTE',
    typePrincipal: 'FINANCIER',
    categories: ['FINANCIER', 'METIER'],
    gravite: 'ELEVEE',
    niveau: 'CRITIQUE',
    resultat: 'SUCCESS',
    typeRessource: 'CAISSE',
    permissionsActives: ['caisse.write'],
  },
  CLOTURER_CAISSE_JOUR: {
    actionAudit: 'CAISSE_CLOTUREE',
    typePrincipal: 'FINANCIER',
    categories: ['FINANCIER', 'METIER'],
    gravite: 'ELEVEE',
    niveau: 'CRITIQUE',
    resultat: 'SUCCESS',
    typeRessource: 'CAISSE',
    permissionsActives: ['caisse.write'],
  },
  CONFIGURER_PARAMETRES_PAIEMENT_ECOLE: {
    actionAudit: 'PARAMETRES_PAIEMENT_CONFIGURES',
    typePrincipal: 'ADMINISTRATIF',
    categories: ['ADMINISTRATIF', 'FINANCIER'],
    gravite: 'ELEVEE',
    niveau: 'CRITIQUE',
    resultat: 'SUCCESS',
    typeRessource: 'ECOLE',
    permissionsActives: ['paiements.write'],
  },
  CREER_GRILLE_TARIFICATION: {
    actionAudit: 'GRILLE_TARIFICATION_CREEE',
    typePrincipal: 'ADMINISTRATIF',
    categories: ['ADMINISTRATIF', 'FINANCIER'],
    gravite: 'ELEVEE',
    niveau: 'CRITIQUE',
    resultat: 'SUCCESS',
    typeRessource: 'ECOLE',
    permissionsActives: ['paiements.write'],
  },
  MODIFIER_GRILLE_TARIFICATION: {
    actionAudit: 'GRILLE_TARIFICATION_MODIFIEE',
    typePrincipal: 'ADMINISTRATIF',
    categories: ['ADMINISTRATIF', 'FINANCIER'],
    gravite: 'ELEVEE',
    niveau: 'CRITIQUE',
    resultat: 'SUCCESS',
    typeRessource: 'ECOLE',
    permissionsActives: ['paiements.write'],
  },
  DESACTIVER_GRILLE_TARIFICATION: {
    actionAudit: 'GRILLE_TARIFICATION_DESACTIVEE',
    typePrincipal: 'ADMINISTRATIF',
    categories: ['ADMINISTRATIF', 'FINANCIER'],
    gravite: 'ELEVEE',
    niveau: 'CRITIQUE',
    resultat: 'SUCCESS',
    typeRessource: 'ECOLE',
    permissionsActives: ['paiements.write'],
  },
  GENERER_OBLIGATIONS_ELEVE: {
    actionAudit: 'OBLIGATIONS_GENEREES',
    typePrincipal: 'FINANCIER',
    categories: ['FINANCIER', 'METIER'],
    gravite: 'MOYENNE',
    niveau: 'INFORMATION',
    resultat: 'SUCCESS',
    typeRessource: 'ELEVE',
    permissionsActives: ['paiements.write'],
  },
};

// Ce fichier branche les actions financieres critiques vers le registre append-only shared/audit.
export class AuditAdapter implements AuditPort {
  public constructor(
    private readonly auditWriter: AuditCanonicalWritePort = new AuditCanonicalWriteService(
      new PostgresAuditCanonicalStorage(),
      new AuditCanonicalEventMapper(),
    ),
  ) {}

  public async journaliserActionFinanciere(input: AuditFinancierInput): Promise<void> {
    const definition = DEFINITIONS_AUDIT_FINANCIER[input.action];
    if (!definition || !input.idOrganisation) {
      return;
    }

    const maintenant = new Date().toISOString();
    const idempotencyKey = this.buildIdempotencyKey(input, definition.actionAudit);
    const idAudit = `audit-financier-${createHash('sha256').update(idempotencyKey).digest('hex').slice(0, 32)}`;
    const requestId = `req-${idAudit}`;
    const roleActif = input.roleActif?.trim()
      || (input.idUtilisateur ? 'UTILISATEUR_AUTHENTIFIE' : undefined);
    const scopesActifs = [
      `ORGANISATION:${input.idOrganisation}`,
      `ECOLE:${input.idEcole}`,
    ];
    const snapshotsAutorises = AUDIT_ACTION_MATRIX[definition.actionAudit].snapshotsAutorises;

    const row: AuditEntryRow = {
      id_audit_entry: idAudit,
      action: definition.actionAudit,
      type_principal: definition.typePrincipal,
      gravite: definition.gravite,
      niveau: definition.niveau,
      resultat: definition.resultat,
      request_id: requestId,
      correlation_id: input.referenceMetier ?? null,
      session_id: null,
      sync_id: null,
      replay_id: null,
      acteur_id: input.idUtilisateur ?? null,
      type_acteur: 'UTILISATEUR',
      role_actif: roleActif ?? null,
      type_ressource: definition.typeRessource,
      id_ressource: input.referenceMetier ?? null,
      libelle_ressource: input.action,
      organisation_id: input.idOrganisation,
      ecole_id: input.idEcole,
      scope: 'ECOLE',
      mode_offline: false,
      statut_synchronisation: null,
      retry_count: 0,
      est_replay: false,
      est_retry: false,
      adresse_ip: null,
      user_agent: null,
      device_id: null,
      source_audit: 'HTTP_API',
      source_runtime: 'HTTP_API',
      version_application: null,
      date_action: maintenant,
      date_creation_audit: maintenant,
      date_synchronisation: null,
      ancien_etat: snapshotsAutorises ? AuditJsonbMapper.serialiser(input.ancienEtat) : null,
      nouvel_etat: snapshotsAutorises
        ? AuditJsonbMapper.serialiser(input.nouvelEtat ?? input.details)
        : null,
      metadata: AuditJsonbMapper.serialiser({
        ...input.details,
        sourceAuditOriginal: 'PAIEMENTS',
        montant: input.montant,
        devise: input.devise,
        actionMetierSource: input.action,
      }),
      contexte_permissions: AuditJsonbMapper.serialiser({
        rolesActifs: roleActif ? [roleActif] : [],
        permissionsActives: [...definition.permissionsActives],
        scopesActifs,
        sourceActeur: 'PAIEMENTS_FACTURATION',
      }),
      contexte_execution: AuditJsonbMapper.serialiser({
        modeExecution: 'SYNCHRONE',
        origineExecution: 'SYNCHRONE',
        retryCount: 0,
      }),
    };

    const categories: AuditCategoryRow[] = definition.categories.map((categorie, index) => ({
      id: index + 1,
      audit_entry_id: idAudit,
      categorie,
    }));

    const entree = AuditEntryPersistenceMapper.depuisRows(row, categories);
    await this.auditWriter.ecrire(entree, idempotencyKey);
  }

  private buildIdempotencyKey(input: AuditFinancierInput, action: string): string {
    const fallback = createHash('sha256')
      .update(JSON.stringify({
        ancienEtat: input.ancienEtat,
        nouvelEtat: input.nouvelEtat,
        details: input.details,
        montant: input.montant,
        devise: input.devise,
      }))
      .digest('hex')
      .slice(0, 24);
    return [
      'PAIEMENTS',
      action,
      input.idOrganisation,
      input.idEcole,
      input.referenceMetier ?? fallback,
    ].join(':');
  }
}
