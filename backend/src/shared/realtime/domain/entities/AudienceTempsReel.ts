import { PermissionTempsReel } from '../value-objects';

export interface AudienceTempsReelProps {
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly utilisateurIds: readonly string[];
  readonly permissionsRequises: readonly string[];
}

export class AudienceTempsReel {
  public readonly organisationId?: string;
  public readonly ecoleId?: string;
  public readonly utilisateurIds: readonly string[];
  public readonly permissionsRequises: readonly PermissionTempsReel[];

  public constructor(props: AudienceTempsReelProps) {
    if (props.utilisateurIds.length === 0) {
      throw new Error('AudienceTempsReel vide');
    }
    this.organisationId = props.organisationId;
    this.ecoleId = props.ecoleId;
    this.utilisateurIds = [...props.utilisateurIds];
    this.permissionsRequises = props.permissionsRequises.map(
      (permission) => new PermissionTempsReel(permission),
    );
  }

  public contientUtilisateur(utilisateurId: string): boolean {
    return this.utilisateurIds.includes(utilisateurId);
  }
}
