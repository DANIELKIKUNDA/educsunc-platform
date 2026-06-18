export class PolicyCapacitesTitulariat {
  private static readonly CAPACITES_ADDITIONNELLES = [
    'bulletins.generate',
    'proclamations.generate',
  ] as const;

  public static listerPermissionsAdditionnelles(): readonly string[] {
    return [...PolicyCapacitesTitulariat.CAPACITES_ADDITIONNELLES];
  }

  public static estCapaciteTitulariat(permission: string): boolean {
    return PolicyCapacitesTitulariat.CAPACITES_ADDITIONNELLES.includes(permission as (typeof PolicyCapacitesTitulariat.CAPACITES_ADDITIONNELLES)[number]);
  }
}
