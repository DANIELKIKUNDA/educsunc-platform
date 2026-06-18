import type { TraceOperationProps } from '../entities';

// Ce fichier declare l evenement de capture d une trace.

/** Cette classe represente la capture d une trace. */
export class TraceCapturee {
  constructor(public readonly payload: TraceOperationProps) {}
}
