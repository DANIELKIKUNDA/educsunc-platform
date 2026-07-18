import { randomUUID } from 'node:crypto';
import type { AuditFinancierInput, AuditPort } from '../../application/ports/AuditPort';
import { AuditEntryPersistenceMapper } from '../../../../shared/audit/infrastructure/persistence/postgres/mappers/AuditEntryPersistenceMapper';
import type {
  AuditCategoryRow,
  AuditEntryRow,
} from '../../../../shared/audit/infrastructure/persistence/postgres/mappers/AuditPersistenceRecords';
import { AuditJsonbMapper } from '../../../../shared/audit/infrastructure/persistence/postgres/mappers/AuditJsonbMapper';
import type { AuditEntryRepository } from '../../../../shared/audit/domain/repositories';
import { PostgresAuditEntryRepository } from '../../../../shared/audit/infrastructure/persistence/postgres/repositories';

type ActionAuditFinancierSupportee =
  | 'PAIEMENT_CREE'
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
  typeRessource: 'PAIEMENT' | 'CAISSE' | 'ECOLE' | 'ELEVE';
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
  public constructor(private readonly auditRepository: AuditEntryRepository = new PostgresAuditEntryRepository()) {}

  public async journaliserActionFinanciere(input: AuditFinancierInput): Promise<void> {
    const definition = DEFINITIONS_AUDIT_FINANCIER[input.action];
    if (!definition || !input.idOrganisation) {
      return;
    }

    const maintenant = new Date().toISOString();
    const idAudit = `audit-financier-${randomUUID()}`;
    const requestId = `req-${idAudit}`;
    const roleActif = input.roleActif?.trim() || undefined;
    const scopesActifs = [
      `ORGANISATION:${input.idOrganisation}`,
      `ECOLE:${input.idEcole}`,
    ];

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
      ancien_etat: AuditJsonbMapper.serialiser(input.ancienEtat),
      nouvel_etat: AuditJsonbMapper.serialiser(input.nouvelEtat ?? input.details),
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
    await this.auditRepository.ajouterAudit(entree);
  }
}
