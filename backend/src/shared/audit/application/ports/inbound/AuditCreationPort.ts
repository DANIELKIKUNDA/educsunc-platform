// Ce port applicatif formalise une frontiere du BC Audit.
import type { CreateAuditEntryInput, CreateExportAuditInput, CreateFinancialAuditInput, CreateOfflineAuditEntryInput, CreatePedagogicalAuditInput, CreateSecurityAuditInput, CreateSensitiveConsultationAuditInput, CreateSynchronizationAuditInput, CreateSystemAuditInput } from '../../dto/inputs';
import type { AuditEntryOutput } from '../../dto/outputs';

// Ce port expose les creations d audits depuis l application.
export interface AuditCreationPort {
  creerAudit(input: CreateAuditEntryInput): Promise<AuditEntryOutput>;
  creerAuditOffline(input: CreateOfflineAuditEntryInput): Promise<AuditEntryOutput>;
  creerAuditSecurite(input: CreateSecurityAuditInput): Promise<AuditEntryOutput>;
  creerAuditFinancier(input: CreateFinancialAuditInput): Promise<AuditEntryOutput>;
  creerAuditPedagogique(input: CreatePedagogicalAuditInput): Promise<AuditEntryOutput>;
  creerAuditExport(input: CreateExportAuditInput): Promise<AuditEntryOutput>;
  creerAuditSynchronisation(input: CreateSynchronizationAuditInput): Promise<AuditEntryOutput>;
  creerAuditConsultationSensible(input: CreateSensitiveConsultationAuditInput): Promise<AuditEntryOutput>;
  creerAuditSysteme(input: CreateSystemAuditInput): Promise<AuditEntryOutput>;
}
