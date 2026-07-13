import { NiveauConfiguration, ValeurConfiguration } from '../../domain';

// Ce fichier declare le DTO de configuration effective.

/** Cette interface represente la configuration effective resolue pour une portee. */
export interface EffectiveConfigurationDto {
  readonly scope: {
    readonly niveau: NiveauConfiguration;
    readonly organisationId?: string;
    readonly ecoleId?: string;
    readonly utilisateurId?: string;
  };
  readonly valeurs: readonly {
    readonly key: string;
    readonly value: ValeurConfiguration;
    readonly sourceNiveau: NiveauConfiguration;
    readonly herite: boolean;
    readonly verrouille: boolean;
    readonly explanation: string;
    readonly sourceConfigurationId?: string;
    readonly sourceStatut?: string;
    readonly sourceTotalVersions?: number;
    readonly sourceCreeLe?: Date;
  }[];
}
