import { NiveauConfiguration, StatutConfiguration, ValeurConfiguration } from '../../domain';

// Ce fichier declare le DTO principal de configuration.

/** Cette interface represente la projection applicative d une configuration gouvernee. */
export interface ConfigurationDto {
  readonly identifiant: string;
  readonly key: string;
  readonly statut: StatutConfiguration;
  readonly scope: {
    readonly niveau: NiveauConfiguration;
    readonly organisationId?: string;
    readonly ecoleId?: string;
    readonly utilisateurId?: string;
  };
  readonly valeur: ValeurConfiguration;
  readonly overrides: readonly {
    readonly scope: {
      readonly niveau: NiveauConfiguration;
      readonly organisationId?: string;
      readonly ecoleId?: string;
      readonly utilisateurId?: string;
    };
    readonly value: ValeurConfiguration;
    readonly actorId: string;
    readonly raison?: string;
    readonly overrideLe: Date;
  }[];
  readonly lock: {
    readonly niveauMinimalAutorise: NiveauConfiguration;
    readonly actorId: string;
    readonly raison?: string;
    readonly verrouilleLe: Date;
  } | null;
  readonly totalVersions: number;
  readonly creeLe: Date;
  readonly gouvernance: {
    readonly proprietaireNiveau: NiveauConfiguration;
    readonly heritable: boolean;
    readonly overridable: boolean;
    readonly visiblePour: readonly NiveauConfiguration[];
    readonly auditRequis: boolean;
    readonly restartRequis: boolean;
  };
}
