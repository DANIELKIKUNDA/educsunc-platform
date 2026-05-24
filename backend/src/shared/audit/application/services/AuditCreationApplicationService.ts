import type { CreateAuditEntryInput } from '../dto/inputs/CreateAuditEntryInput';
import type { CreateOfflineAuditEntryInput } from '../dto/inputs/CreateOfflineAuditEntryInput';
import type { CreateSecurityAuditInput } from '../dto/inputs/CreateSecurityAuditInput';
import type { CreateFinancialAuditInput } from '../dto/inputs/CreateFinancialAuditInput';
import type { CreatePedagogicalAuditInput } from '../dto/inputs/CreatePedagogicalAuditInput';
import type { CreateSystemAuditInput } from '../dto/inputs/CreateSystemAuditInput';
import type { CreateSensitiveConsultationAuditInput } from '../dto/inputs/CreateSensitiveConsultationAuditInput';
import type { CreateExportAuditInput } from '../dto/inputs/CreateExportAuditInput';
import type { CreateSynchronizationAuditInput } from '../dto/inputs/CreateSynchronizationAuditInput';
import type { AuditEntryOutput } from '../dto/outputs/AuditEntryOutput';
import { AuditEntryMapper } from '../mappers/AuditEntryMapper';
import { AuditFinancialMapper } from '../mappers/AuditFinancialMapper';
import { AuditOfflineMapper } from '../mappers/AuditOfflineMapper';
import { AuditSecurityMapper } from '../mappers/AuditSecurityMapper';
import { AuditSynchronizationMapper } from '../mappers/AuditSynchronizationMapper';

// Ce service applicatif orchestre une famille de workflows Audit.
export class AuditCreationApplicationService {
  public async creerAudit(payload: CreateAuditEntryInput): Promise<AuditEntryOutput> {
    return AuditEntryMapper.depuisCreateAuditEntryInput(payload);
  }

  public async creerAuditSecurite(payload: CreateSecurityAuditInput): Promise<AuditEntryOutput> {
    const normalise = AuditSecurityMapper.depuisSecurityInput(payload);
    return AuditEntryMapper.depuisCreateAuditEntryInput({
      action: payload.action,
      typePrincipal: 'SECURITE',
      categories: ['SECURITE'],
      gravite: payload.gravite,
      resultat: payload.resultat,
      acteur: { typeActeur: 'UTILISATEUR' },
      contexte: { sourceAudit: 'SECURITY', modeOffline: false, ...payload.contexte },
      tenant: { scope: 'PLATEFORME' },
      metadata: normalise,
    });
  }

  public async creerAuditFinancier(payload: CreateFinancialAuditInput): Promise<AuditEntryOutput> {
    return AuditEntryMapper.depuisCreateAuditEntryInput({
      action: payload.action,
      typePrincipal: 'FINANCIER',
      categories: ['FINANCIER'],
      resultat: payload.resultat,
      acteur: { typeActeur: 'UTILISATEUR' },
      ancienEtat: payload.ancienEtat,
      nouvelEtat: payload.nouvelEtat,
      contexte: { sourceAudit: 'PAIEMENTS', modeOffline: false, ...payload.contexte },
      tenant: { scope: 'ECOLE' },
      metadata: AuditFinancialMapper.depuisFinancialInput(payload),
    });
  }

  public async creerAuditPedagogique(payload: CreatePedagogicalAuditInput): Promise<AuditEntryOutput> {
    return AuditEntryMapper.depuisCreateAuditEntryInput({
      action: payload.action,
      typePrincipal: 'PEDAGOGIQUE',
      categories: ['PEDAGOGIQUE'],
      resultat: payload.resultat,
      acteur: { typeActeur: 'ENSEIGNANT' },
      ancienEtat: payload.ancienEtat,
      nouvelEtat: payload.nouvelEtat,
      ressource: payload.coursId ? { typeRessource: 'COURS', idRessource: payload.coursId } : undefined,
      contexte: { sourceAudit: 'BULLETINS', modeOffline: false, ...payload.contexte },
      tenant: { scope: 'ECOLE' },
      metadata: { classeId: payload.classeId, coursId: payload.coursId },
    });
  }

  public async creerAuditSysteme(payload: CreateSystemAuditInput): Promise<AuditEntryOutput> {
    return AuditEntryMapper.depuisCreateAuditEntryInput({
      action: payload.action,
      typePrincipal: 'SYSTEME',
      categories: ['SYSTEME'],
      resultat: payload.resultat,
      acteur: { typeActeur: 'SYSTEME' },
      contexte: { sourceAudit: payload.sourceSysteme ?? 'SYSTEME', modeOffline: false, ...payload.contexte },
      tenant: { scope: 'PLATEFORME' },
      metadata: { sourceSysteme: payload.sourceSysteme },
    });
  }

  public async creerAuditConsultationSensible(payload: CreateSensitiveConsultationAuditInput): Promise<AuditEntryOutput> {
    return AuditEntryMapper.depuisCreateAuditEntryInput({
      action: payload.action,
      typePrincipal: 'CONSULTATION_SENSIBLE',
      categories: ['SECURITE', 'CONSULTATION'],
      resultat: payload.resultat,
      acteur: { typeActeur: 'UTILISATEUR' },
      ressource: { typeRessource: 'CIBLE', idRessource: payload.cible, libelle: payload.cible },
      contexte: { sourceAudit: 'CONSULTATION', modeOffline: false, ...payload.contexte },
      tenant: { scope: 'ECOLE' },
      metadata: { cible: payload.cible, justification: payload.justification },
    });
  }

  public async creerAuditExport(payload: CreateExportAuditInput): Promise<AuditEntryOutput> {
    return AuditEntryMapper.depuisCreateAuditEntryInput({
      action: payload.action,
      typePrincipal: 'EXPORT',
      categories: ['EXPORT'],
      resultat: payload.resultat,
      acteur: { typeActeur: 'UTILISATEUR' },
      contexte: { sourceAudit: 'EXPORT', modeOffline: false, ...payload.contexte },
      tenant: { scope: 'ORGANISATION' },
      metadata: { formatExport: payload.formatExport, nombreLignes: payload.nombreLignes },
    });
  }

  public async creerAuditSynchronisation(payload: CreateSynchronizationAuditInput): Promise<AuditEntryOutput> {
    return AuditEntryMapper.depuisCreateAuditEntryInput({
      action: payload.action,
      typePrincipal: 'SYNCHRONISATION',
      categories: ['SYNC', 'OFFLINE'],
      resultat: payload.resultat,
      acteur: { typeActeur: 'SYSTEME' },
      contexte: { sourceAudit: 'SYNC', modeOffline: payload.replay === true, ...payload.contexte },
      tenant: { scope: 'ECOLE' },
      metadata: AuditSynchronizationMapper.depuisSynchronizationInput(payload),
    });
  }

  public async creerAuditOffline(payload: CreateOfflineAuditEntryInput): Promise<AuditEntryOutput> {
    const statut = AuditOfflineMapper.depuisOfflineInput(payload);
    return AuditEntryMapper.depuisCreateAuditEntryInput({
      action: 'OFFLINE_CAPTURED',
      typePrincipal: 'OFFLINE',
      categories: ['OFFLINE', 'SYNC'],
      resultat: payload.statutSynchronisation,
      acteur: { typeActeur: 'APPAREIL' },
      contexte: { sourceAudit: 'OFFLINE', modeOffline: true, deviceId: payload.appareil },
      tenant: { scope: 'ECOLE' },
      metadata: { statut },
    });
  }
}
