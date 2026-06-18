export class PresentateurDiagnosticsRealtimeHttp {
  public static presenterDiagnostic(diagnostic: {
    readonly observabilite: Record<string, unknown>;
    readonly totalSignaux: number;
    readonly totalMessagesJournalises: number;
  }) {
    return { diagnostic };
  }
}
