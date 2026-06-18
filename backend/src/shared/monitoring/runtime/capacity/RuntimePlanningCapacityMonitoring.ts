import type { CapacityDto } from '../../application';

// Ce fichier declare le runtime de planning de capacite.

export class RuntimePlanningCapacityMonitoring {
  public projeter(capacites: readonly CapacityDto[]): {
    readonly capacitesCritiques: number;
    readonly capacitesTotales: number;
  } {
    return {
      capacitesCritiques: capacites.filter((capacite) => capacite.niveau === 'CRITICAL').length,
      capacitesTotales: capacites.length,
    };
  }
}
