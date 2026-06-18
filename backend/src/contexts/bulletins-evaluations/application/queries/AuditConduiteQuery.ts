// Cette query expose la lecture optimisee des traces d'encodage de conduite.
export interface AuditConduiteQuery {
  executer(idResultatBulletinEleve: string): Promise<AuditConduiteReadModel[]>;
}

export interface AuditConduiteReadModel {
  action: string;
  dateAction: Date;
  idUtilisateur?: string;
  commentaire?: string;
}
