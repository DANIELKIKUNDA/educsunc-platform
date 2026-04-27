// Ce fichier definit le port applicatif vers le BC Bulletins et Evaluations.
/**
 * Ce port informe les evaluations des changements scolaires structurants.
 */
export interface BulletinsEvaluationsPort {
  notifierAbandonEleve(idEleve: string): Promise<void>;
  notifierTransfertEleve(idEleve: string): Promise<void>;
  notifierChangementClasse(idEleve: string, idNouvelleClassePedagogique: string): Promise<void>;
}
