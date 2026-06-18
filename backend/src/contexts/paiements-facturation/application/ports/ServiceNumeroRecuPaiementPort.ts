export interface ServiceNumeroRecuPaiementPort {
  generer(idEcole: string, annee?: number): Promise<string>;
}
