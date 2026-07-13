/** Garantit qu un ensemble d ecritures Configuration reussit ou est annule ensemble. */
export interface PortUniteTravailConfiguration {
  dansTransaction<T>(operation: () => Promise<T>): Promise<T>;
}

/** Implementation neutre utilisee par la memoire et les tests unitaires. */
export class UniteTravailConfigurationImmediate implements PortUniteTravailConfiguration {
  public dansTransaction<T>(operation: () => Promise<T>): Promise<T> {
    return operation();
  }
}
