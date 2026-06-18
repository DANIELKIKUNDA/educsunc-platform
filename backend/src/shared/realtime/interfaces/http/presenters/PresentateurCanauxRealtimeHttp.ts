export class PresentateurCanauxRealtimeHttp {
  public static presenterCanaux(canaux: readonly string[]) {
    return {
      canaux: canaux.map((nom) => ({ nom, publicAutorise: false })),
    };
  }
}
