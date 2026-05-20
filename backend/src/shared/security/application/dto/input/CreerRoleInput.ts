// Ce DTO porte la commande de creation d'un role SECURITY.
export interface CreerRoleInput {
  codeRole: string;
  nomRole: string;
  description?: string;
  niveauAcces: string;
  estSysteme?: boolean;
  creePar?: string;
  permissions: string[];
}
