import { TraceOperation } from '../../domain';
import type { TraceDto } from '../dto/output';

// Ce fichier declare le mapper de traces.

/** Cette classe transforme les traces en DTO applicatifs. */
export class TraceMapper {
  /** Cette methode projette une trace en DTO. */
  public versDto(trace: TraceOperation): TraceDto {
    return trace.valeur();
  }
}
