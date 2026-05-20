export interface PermissionRepositoryPort {
  listerPermissionsRole(codeRole: string): Promise<readonly string[]>;
}
