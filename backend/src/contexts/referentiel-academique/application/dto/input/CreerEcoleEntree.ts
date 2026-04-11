import { ModeExploitation } from '../../../domain/value-objects/ModeExploitation';

// Ce DTO represente les donnees attendues pour creer une ecole.
export interface CreerEcoleEntree {
  idOrganisation: string;
  code: string;
  nom: string;
  modeExploitation: ModeExploitation;
  creePar: string;
  sigle?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
}
