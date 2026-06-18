export class RuntimeReplayLegerRealtime {
  public executer() {
    return {
      replayed: true,
      executedAt: new Date().toISOString(),
    };
  }
}
