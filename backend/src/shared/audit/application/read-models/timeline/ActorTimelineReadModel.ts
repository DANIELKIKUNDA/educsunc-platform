// Ce read-model optimise une lecture applicative du BC Audit.
import type { TimelineEventReadModel } from './TimelineEventReadModel';

export interface ActorTimelineReadModel { readonly acteurId?: string; readonly items: readonly TimelineEventReadModel[]; }
