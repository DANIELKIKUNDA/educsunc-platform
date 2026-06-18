import type { SaturationProps } from '../entities';

// Ce fichier declare l evenement de saturation detectee.

/** Cette classe represente la detection d une saturation. */
export class SaturationDetectee {
  constructor(public readonly payload: SaturationProps) {}
}
