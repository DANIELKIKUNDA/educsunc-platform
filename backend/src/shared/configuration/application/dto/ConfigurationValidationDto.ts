// Ce fichier declare le DTO de validation.

/** Cette interface represente le resultat applicatif d une validation. */
export interface ConfigurationValidationDto {
  readonly valide: boolean;
  readonly warnings: readonly string[];
}
