// Ce fichier declare le plan d execution operational d une propagation.

export interface PlanExecutionPropagationConfiguration {
  readonly configurationId: string;
  readonly canauxCibles: readonly string[];
  readonly priorite: 'NORMALE' | 'HAUTE';
}
