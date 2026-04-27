// Ce fichier definit le port applicatif vers le BC Paiements et Facturation.
/**
 * Ce port transmet au BC Paiements les faits de scolarite qui peuvent influencer la facturation.
 */
export interface PaiementsFacturationPort {
  notifierFamilleNombreuse(idFamille: string, eligible: boolean): Promise<void>;
  notifierAbandonEleve(idEleve: string): Promise<void>;
  notifierTransfertEleve(idEleve: string): Promise<void>;
}
