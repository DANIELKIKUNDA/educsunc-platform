// Ce fichier declare l entite de branding d une ecole.

/** Cette interface represente un logo gouverne par la configuration. */
export interface LogoBrandingConfiguration {
  readonly url: string;
  readonly format?: 'SVG' | 'PNG' | 'JPG';
  readonly largeurPixels?: number;
  readonly hauteurPixels?: number;
  readonly alt?: string;
  readonly actif: boolean;
}

/** Cette interface represente un signataire officiel autorise sur les documents. */
export interface SignataireBrandingConfiguration {
  readonly nom: string;
  readonly fonction: string;
  readonly signatureImage?: string;
  readonly ordreAffichage: number;
  readonly actif: boolean;
}

/** Cette interface represente les parametres documentaires visibles des editions. */
export interface ParametresDocumentairesBrandingConfiguration {
  readonly nomEtablissement?: string;
  readonly devise?: string;
  readonly adresse?: string;
  readonly telephone?: string;
  readonly email?: string;
  readonly siteWeb?: string;
  readonly afficherEnteteSurDocuments: boolean;
  readonly afficherPiedDePageSurDocuments: boolean;
}

/** Cette interface represente l identite de communication issue du branding. */
export interface IdentiteCommunicationBrandingConfiguration {
  readonly expediteurNom?: string;
  readonly expediteurEmail?: string;
  readonly signatureMessage?: string;
  readonly tonEditorial?: string;
}

/** Cette interface represente les donnees de branding possedees par Configuration. */
export interface BrandingConfigurationProps {
  readonly logoPrincipal?: LogoBrandingConfiguration;
  readonly logoSecondaire?: LogoBrandingConfiguration;
  readonly couleurPrincipale?: string;
  readonly couleurSecondaire?: string;
  readonly slogan?: string;
  readonly banniere?: string;
  readonly signataires: readonly SignataireBrandingConfiguration[];
  readonly parametresDocumentaires: ParametresDocumentairesBrandingConfiguration;
  readonly identiteCommunication: IdentiteCommunicationBrandingConfiguration;
}

/** Cette classe represente l identite visuelle configurable d un etablissement. */
export class BrandingConfiguration {
  constructor(private readonly props: BrandingConfigurationProps) {}

  /** Cette methode retourne le logo principal effectivement utilisable. */
  public logoPrincipalActif(): LogoBrandingConfiguration | null {
    if (!this.props.logoPrincipal || !this.props.logoPrincipal.actif) {
      return null;
    }

    return { ...this.props.logoPrincipal };
  }

  /** Cette methode retourne les signataires actifs tries dans l ordre d affichage. */
  public signatairesActifs(): readonly SignataireBrandingConfiguration[] {
    return [...this.props.signataires]
      .filter((signataire) => signataire.actif)
      .sort((gauche, droite) => gauche.ordreAffichage - droite.ordreAffichage)
      .map((signataire) => ({ ...signataire }));
  }

  /** Cette methode retourne les donnees de branding. */
  public valeur(): BrandingConfigurationProps {
    return {
      ...this.props,
      logoPrincipal: this.props.logoPrincipal ? { ...this.props.logoPrincipal } : undefined,
      logoSecondaire: this.props.logoSecondaire ? { ...this.props.logoSecondaire } : undefined,
      signataires: this.props.signataires.map((signataire) => ({ ...signataire })),
      parametresDocumentaires: { ...this.props.parametresDocumentaires },
      identiteCommunication: { ...this.props.identiteCommunication },
    };
  }
}
