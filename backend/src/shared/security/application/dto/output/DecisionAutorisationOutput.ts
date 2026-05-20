export interface DecisionAutorisationOutput {
  autorise: boolean;
  permissionDemandee: string;
  raisonRefus?: string;
  scopeValide: boolean;
  restrictionRespectee: boolean;
}
