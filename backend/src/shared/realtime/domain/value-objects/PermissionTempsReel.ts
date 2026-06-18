export class PermissionTempsReel {
  public constructor(public readonly value: string) {
    if (!value.trim()) {
      throw new Error('PermissionTempsReel invalide');
    }
  }
}
