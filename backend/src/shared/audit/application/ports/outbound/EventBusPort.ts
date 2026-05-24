// Ce port applicatif formalise une frontiere du BC Audit.
export interface EventBusPort { publier(nomEvenement: string, payload: Record<string, unknown>): Promise<void>; }
