// Ce read-model optimise une lecture applicative du BC Audit.
import type { TimelineEventReadModel } from './TimelineEventReadModel';

export interface AuditTimelineReadModel { readonly correlationId?: string; readonly items: readonly TimelineEventReadModel[]; }
