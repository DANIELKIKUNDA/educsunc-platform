import type { BulletinEleveReadModel } from '../read-models/BulletinEleveReadModel';

// Cette query lit rapidement un bulletin complet pret a afficher.
export interface BulletinEleveQuery {
  executer(idEleve: string, idAnneeScolaire: string): Promise<BulletinEleveReadModel | null>;
  executerParId(idBulletinEleve: string): Promise<BulletinEleveReadModel | null>;
}
