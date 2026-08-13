import type { AuditExportQuery } from '../../dto/queries/AuditExportQuery';
import type { AuditExportOutput } from '../../dto/outputs/AuditExportOutput';

export interface AuditExportAccessContext {
  readonly demandeurId?: string;
  readonly scope: 'PLATEFORME' | 'ORGANISATION' | 'ECOLE';
  readonly organisationId?: string;
  readonly ecoleId?: string;
}

export interface AuditExportStatusOutput {
  readonly exportId: string;
  readonly statut: string;
  readonly nombreElements: number;
  readonly erreur?: string;
  readonly expireLe?: string;
}

export interface AuditExportDownloadOutput {
  readonly exportId: string;
  readonly nomFichier: string;
  readonly mimeType: string;
  readonly cheminPrive: string;
  readonly tailleOctets: number;
}

export interface AuditExportOperationsPort {
  demander(payload: AuditExportQuery): Promise<AuditExportOutput>;
  obtenirStatut(exportId: string, contexte: AuditExportAccessContext): Promise<AuditExportStatusOutput>;
  preparerTelechargement(exportId: string, contexte: AuditExportAccessContext): Promise<AuditExportDownloadOutput>;
  supprimer(exportId: string, contexte: AuditExportAccessContext): Promise<void>;
}
