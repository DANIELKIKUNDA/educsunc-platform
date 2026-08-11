import type { AuditEntryOutput } from '../../dto/outputs/AuditEntryOutput';

export interface AuditReadFilters {
  readonly idAuditEntry?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly scope?: string;
  readonly acteurId?: string;
  readonly typeAuditPrincipal?: string;
  readonly categorieAudit?: string;
  readonly action?: string;
  readonly gravite?: string;
  readonly resultat?: string;
  readonly typeRessource?: string;
  readonly ressourceId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly sourceAudit?: string;
  readonly adresseIp?: string;
  readonly dateDebut?: string;
  readonly dateFin?: string;
}

export interface AuditReadCursorPosition {
  readonly dateAction: string;
  readonly idAuditEntry: string;
}

export interface AuditReadPageRequest {
  readonly limite: number;
  readonly position?: AuditReadCursorPosition;
}

export interface AuditReadPage {
  readonly items: readonly AuditEntryOutput[];
  readonly hasNextPage: boolean;
}

export interface AuditReadStatistics {
  readonly total: number;
  readonly critiques: number;
  readonly echecs: number;
  readonly exports: number;
  readonly securite: number;
  readonly replays: number;
  readonly retries: number;
}

export interface AuditReadRepositoryPort {
  rechercher(filtres: AuditReadFilters, pagination: AuditReadPageRequest): Promise<AuditReadPage>;
  obtenirParId(filtres: AuditReadFilters): Promise<AuditEntryOutput | null>;
  compter(filtres: AuditReadFilters): Promise<AuditReadStatistics>;
}
