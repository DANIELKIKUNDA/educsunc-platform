import { Entite } from '../../../domain/Entity';
import { CanalNotification, NiveauPreferenceNotification, StrategieCiblage, TypeDestinataireNotification, VisibiliteNotification } from '../enumerations';

/**
 * Cette entite represente une cible de communication resolue par le domaine.
 */
export class DestinataireNotification extends Entite<string> {
  public readonly type: TypeDestinataireNotification;
  public readonly strategieCiblage: StrategieCiblage;
  public readonly adresse?: string;
  public readonly utilisateurId?: string;
  public readonly parentId?: string;
  public readonly roleCode?: string;
  public readonly classeId?: string;
  private readonly ecoleId?: string;
  private readonly organisationId?: string;
  public readonly visibilite: VisibiliteNotification;
  private readonly canauxAutorises: CanalNotification[];
  public readonly niveauPreference: NiveauPreferenceNotification;

  /**
   * Ce constructeur hydrate un destinataire avec son contexte de diffusion.
   */
  constructor(
    identifiant: string,
    type: TypeDestinataireNotification,
    strategieCiblage: StrategieCiblage,
    visibilite: VisibiliteNotification,
    canauxAutorises: CanalNotification[],
    niveauPreference: NiveauPreferenceNotification,
    adresse?: string,
    utilisateurId?: string,
    parentId?: string,
    roleCode?: string,
    classeId?: string,
    ecoleId?: string,
    organisationId?: string,
  ) {
    super(identifiant);
    this.type = type;
    this.strategieCiblage = strategieCiblage;
    this.visibilite = visibilite;
    this.canauxAutorises = [...canauxAutorises];
    this.niveauPreference = niveauPreference;
    this.adresse = DestinataireNotification.nettoyer(adresse);
    this.utilisateurId = DestinataireNotification.nettoyer(utilisateurId);
    this.parentId = DestinataireNotification.nettoyer(parentId);
    this.roleCode = DestinataireNotification.nettoyer(roleCode);
    this.classeId = DestinataireNotification.nettoyer(classeId);
    this.ecoleId = DestinataireNotification.nettoyer(ecoleId);
    this.organisationId = DestinataireNotification.nettoyer(organisationId);
  }

  /** Cette methode expose les canaux autorises pour ce destinataire. */
  public obtenirCanauxAutorises(): CanalNotification[] { return [...this.canauxAutorises]; }

  /** Cette methode expose l'ecole rattachee au destinataire si elle existe. */
  public obtenirEcoleId(): string | undefined { return this.ecoleId; }

  /** Cette methode expose l'organisation rattachee au destinataire si elle existe. */
  public obtenirOrganisationId(): string | undefined { return this.organisationId; }

  /** Cette methode normalise les valeurs textuelles optionnelles. */
  private static nettoyer(valeur?: string): string | undefined {
    const propre = String(valeur ?? '').trim();
    return propre.length > 0 ? propre : undefined;
  }
}
