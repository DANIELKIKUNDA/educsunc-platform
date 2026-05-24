// Ce read-model optimise une lecture applicative du BC Audit.
import type { TimelineEventReadModel } from './TimelineEventReadModel';

export interface ResourceTimelineReadModel { readonly ressourceId?: string; readonly items: readonly TimelineEventReadModel[]; }
