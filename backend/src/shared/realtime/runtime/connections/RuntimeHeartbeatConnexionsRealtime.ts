export class RuntimeHeartbeatConnexionsRealtime {
  public battre() {
    return {
      vivant: true,
      checkedAt: new Date().toISOString(),
    };
  }
}
