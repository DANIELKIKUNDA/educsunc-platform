export class ManifestRuntimeRealtime {
  public lire() {
    return {
      nom: 'realtime-runtime',
      composants: ['connections', 'subscriptions', 'broadcast', 'observability'],
    };
  }
}
