// Ce DTO porte le contexte minimal requis pour relire l'historique securise d'un bulletin.
export interface ConsulterHistoriqueBulletinInput {
  idBulletinEleve: string;
  idUtilisateur: string;
  idEcole: string;
  idOrganisation?: string;
}
