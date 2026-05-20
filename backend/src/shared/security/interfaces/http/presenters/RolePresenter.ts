import type { RoleOutput } from 'shared/security/application';

// Ce presenter stabilise la sortie HTTP des roles SECURITY.
export class RolePresenter {
  public static presenter(sortie: RoleOutput): { donnee: { success: true; data: RoleOutput } } {
    return { donnee: { success: true, data: sortie } };
  }
}
