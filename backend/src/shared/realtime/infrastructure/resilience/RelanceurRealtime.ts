export class RelanceurRealtime {
  public relancer() {
    return {
      succes: true,
      restartedAt: new Date().toISOString(),
    };
  }
}
