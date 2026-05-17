import { MotifNonClasse } from '../value-objects/MotifNonClasse';
import { SexeEleve } from '../value-objects/SexeEleve';
import { CodeColonneBulletin } from '../value-objects/CodeColonneBulletin';

// Cette classe decrit un eleve ecarte du classement pour causes metier.
export class EleveNonClasseProclamation {
  private idEleve: string;
  private nomComplet: string;
  private sexe: SexeEleve;
  private motifs: MotifNonClasse[];
  private coursManquants: string[];
  private colonnesManquantes: CodeColonneBulletin[];

  // Ce constructeur initialise la description d'un non-classe.
  constructor(params: {
    idEleve: string;
    nomComplet: string;
    sexe: SexeEleve;
    motifs: MotifNonClasse[];
    coursManquants: string[];
    colonnesManquantes: CodeColonneBulletin[];
  }) {
    this.idEleve = params.idEleve;
    this.nomComplet = params.nomComplet;
    this.sexe = params.sexe;
    this.motifs = [...params.motifs];
    this.coursManquants = [...params.coursManquants];
    this.colonnesManquantes = [...params.colonnesManquantes];
  }

  // Cette methode expose l'identifiant de l'eleve.
  public obtenirIdEleve(): string {
    return this.idEleve;
  }

  // Cette methode expose le nom complet de l'eleve.
  public obtenirNomComplet(): string {
    return this.nomComplet;
  }

  // Cette methode expose le sexe de l'eleve.
  public obtenirSexe(): SexeEleve {
    return this.sexe;
  }

  // Cette methode expose les motifs de non classement.
  public obtenirMotifs(): MotifNonClasse[] {
    return [...this.motifs];
  }

  // Cette methode expose les cours manquants impliques.
  public obtenirCoursManquants(): string[] {
    return [...this.coursManquants];
  }

  // Cette methode expose les colonnes manquantes impliquees.
  public obtenirColonnesManquantes(): CodeColonneBulletin[] {
    return [...this.colonnesManquantes];
  }
}
