// Cette query expose la lecture optimisee des traces d'encodage et de modification.
export interface AuditEncodageQuery {
  executer(idFicheCotationEleveCours: string): Promise<AuditEncodageReadModel[]>;
}

export interface AuditEncodageReadModel {
  action: string;
  dateAction: Date;
  idUtilisateur?: string;
  commentaire?: string;
}
