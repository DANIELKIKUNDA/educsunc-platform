export interface ReplayContext {
  readonly replayId?: string;
  readonly replayReason?: string;
  readonly replaySource?: string;
  readonly replayDepth?: number;
  readonly replayTimestamp?: string;
  readonly replayWindow?: string;
}

