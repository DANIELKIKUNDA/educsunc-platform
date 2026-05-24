export interface SynchronizationContext {
  readonly syncId?: string;
  readonly syncSource?: string;
  readonly syncTarget?: string;
  readonly offlineDuration?: number;
  readonly syncVersion?: string;
  readonly chronologyMetadata: Record<string, string | number | boolean>;
  readonly deviceMetadata: Record<string, string | number | boolean>;
}

