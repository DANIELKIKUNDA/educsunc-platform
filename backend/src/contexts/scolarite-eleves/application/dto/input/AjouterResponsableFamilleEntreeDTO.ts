import { LienParente } from '../../../domain/value-objects/LienParente';
import { ContexteCommandeScolariteDTO } from './CommandesCommunesDTO';

// Ce fichier definit l'entree pour ajouter un responsable familial.
export interface AjouterResponsableFamilleEntreeDTO extends ContexteCommandeScolariteDTO {
  idFamille: string;
  idResponsableFamille: string;
  nomComplet: string;
  telephone: string;
  telephoneSecondaire?: string;
  profession?: string;
  lienParente: LienParente;
  adresse?: string;
  estPrincipal: boolean;
}
