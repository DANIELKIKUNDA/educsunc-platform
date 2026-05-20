export interface DecisionAutorisationReadModel {
  autorise: boolean;
  permissionDemandee: string;
  raisonRefus?: string;
  scopeValide: boolean;
  restrictionRespectee: boolean;
}
