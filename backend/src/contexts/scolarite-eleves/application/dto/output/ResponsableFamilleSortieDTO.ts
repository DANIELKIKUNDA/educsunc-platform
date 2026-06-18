import { LienParente } from '../../../domain/value-objects/LienParente';

// Ce fichier definit la sortie applicative d'un responsable familial.
export interface ResponsableFamilleSortieDTO {
  idResponsableFamille: string;
  nomComplet: string;
  telephone: string;
  telephoneSecondaire?: string;
  profession?: string;
  lienParente: LienParente;
  adresse?: string;
  estPrincipal: boolean;
  idUtilisateurAuth?: string;
}
