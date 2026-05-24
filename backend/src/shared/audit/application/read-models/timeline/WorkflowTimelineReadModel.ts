// Ce read-model optimise une lecture applicative du BC Audit.
import type { TimelineEventReadModel } from './TimelineEventReadModel';

export interface WorkflowTimelineReadModel { readonly workflowId?: string; readonly items: readonly TimelineEventReadModel[]; }
