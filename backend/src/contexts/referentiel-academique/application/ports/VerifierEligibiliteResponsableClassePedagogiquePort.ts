export interface EligibiliteResponsableClassePedagogiqueReadModel {
  utilisateurExiste: boolean;
  utilisateurActif: boolean;
  codeRoleActif?: string;
  idOrganisation?: string;
  idEcole?: string;
}

export interface VerifierEligibiliteResponsableClassePedagogiquePort {
  verifier(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<EligibiliteResponsableClassePedagogiqueReadModel>;
}
