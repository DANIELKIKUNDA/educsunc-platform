// Ce fichier declare les types techniques de propagation.

/** Cette union represente les natures de propagation gerees par l infrastructure. */
export type TypePropagationConfiguration = 'CONFIGURATION' | 'OVERRIDE' | 'MODULE' | 'SUPPRESSION';

/** Cette interface represente un journal de propagation technique. */
export interface JournalPropagationConfiguration {
  readonly type: TypePropagationConfiguration;
  readonly configurationId: string;
  readonly canauxCibles: readonly string[];
  readonly executeLe: Date;
  readonly succes: boolean;
}
