export class RuntimeReconnexionRealtime {
  public reevaluer() {
    return {
      reconnexionAutorisee: true,
      checkedAt: new Date().toISOString(),
    };
  }
}
