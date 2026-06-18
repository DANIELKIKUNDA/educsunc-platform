import { NIVEAUX_CONFIGURATION, NiveauConfiguration } from '../enums';

// Ce fichier centralise les constantes de scopes du module Configuration.

/** Cette constante expose la hierarchie officielle de priorite des scopes. */
export const HIERARCHIE_SCOPES_CONFIGURATION: readonly NiveauConfiguration[] = NIVEAUX_CONFIGURATION;

/** Cette fonction retourne la priorite numerique d un niveau. */
export const lirePrioriteNiveauConfiguration = (niveau: NiveauConfiguration): number =>
  HIERARCHIE_SCOPES_CONFIGURATION.indexOf(niveau);
