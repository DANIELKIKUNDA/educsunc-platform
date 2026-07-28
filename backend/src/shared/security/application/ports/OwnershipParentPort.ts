export interface OwnershipParentPort {
  listerElevesAutorises(params: {
    idUtilisateur: string;
    idEcole: string;
  }): Promise<readonly string[]>;
}
