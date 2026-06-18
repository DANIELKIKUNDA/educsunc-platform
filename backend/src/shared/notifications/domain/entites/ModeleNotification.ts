import { Entite } from '../../../domain/Entity';
import { CanalNotification, TypeNotification } from '../enumerations';

/**
 * Cette entite represente un modele de contenu reutilisable et versionne.
 */
export class ModeleNotification extends Entite<string> {
  public readonly codeModele: string;
  public readonly canal: CanalNotification;
  public readonly typeNotification: TypeNotification;
  public readonly version: number;
  public readonly corps: string;
  public readonly placeholdersObligatoires: string[];
  public readonly verrouille: boolean;

  /**
   * Ce constructeur hydrate un modele de notification versionne.
   */
  constructor(
    identifiant: string,
    codeModele: string,
    canal: CanalNotification,
    typeNotification: TypeNotification,
    version: number,
    corps: string,
    placeholdersObligatoires: string[] = [],
    verrouille = false,
  ) {
    super(identifiant);
    this.codeModele = codeModele.trim();
    this.canal = canal;
    this.typeNotification = typeNotification;
    this.version = version;
    this.corps = corps.trim();
    this.placeholdersObligatoires = [...placeholdersObligatoires];
    this.verrouille = verrouille;
  }
}
