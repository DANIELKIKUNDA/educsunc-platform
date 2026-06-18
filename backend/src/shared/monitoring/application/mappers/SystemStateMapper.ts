import { EtatSysteme, InstantaneSante } from '../../domain';
import type { HealthSnapshotDto, SystemStateDto } from '../dto/output';

// Ce fichier declare le mapper d etat systeme.

/** Cette classe transforme les agregats d etat en DTO applicatifs. */
export class SystemStateMapper {
  /** Cette methode projette un etat systeme en DTO. */
  public versDto(etat: EtatSysteme): SystemStateDto {
    return etat.details();
  }

  /** Cette methode projette un snapshot de sante en DTO. */
  public versSnapshotDto(snapshot: InstantaneSante): HealthSnapshotDto {
    return snapshot.details();
  }
}
