export class StrategieDegradationRealtime {
  public appliquer(runtimeDisponible: boolean) {
    return {
      mode: runtimeDisponible ? 'NORMAL' : 'DEGRADE',
      offlineFirstRespecte: true,
    };
  }
}
