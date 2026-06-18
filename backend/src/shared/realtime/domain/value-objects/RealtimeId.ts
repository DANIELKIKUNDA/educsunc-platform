export class RealtimeId {
  public constructor(public readonly value: string) {
    if (!value.trim()) {
      throw new Error('RealtimeId invalide');
    }
  }
}
