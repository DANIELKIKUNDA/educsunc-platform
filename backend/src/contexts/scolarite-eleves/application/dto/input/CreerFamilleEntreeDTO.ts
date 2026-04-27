import { ContexteCommandeScolariteDTO } from './CommandesCommunesDTO';

// Ce fichier definit les donnees necessaires pour creer une famille.
export interface CreerFamilleEntreeDTO extends ContexteCommandeScolariteDTO {
  idFamille: string;
  codeFamille: string;
  nomFamille: string;
  adresse?: string;
  telephonePrincipal: string;
  email?: string;
}
