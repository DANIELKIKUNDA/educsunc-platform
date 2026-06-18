import { lirePrioriteNiveauConfiguration } from '../constants';
import { NiveauConfiguration } from '../enums';
import { ExceptionScopeInvalide } from '../exceptions';

// Ce fichier declare la portee metier d une configuration.

/** Cette interface represente les identifiants de portee pouvant accompagner un niveau. */
export interface PorteeConfigurationProps {
  readonly niveau: NiveauConfiguration;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly utilisateurId?: string;
}

/** Cette classe represente une portee valide du module Configuration. */
export class ConfigurationScope {
  private constructor(private readonly props: PorteeConfigurationProps) {}

  /** Cette methode cree une portee valide en fonction du niveau fourni. */
  public static creer(props: PorteeConfigurationProps): ConfigurationScope {
    if (props.niveau === 'ORGANIZATION' && !props.organisationId) {
      throw new ExceptionScopeInvalide('Une portee ORGANIZATION exige un identifiant organisation.');
    }
    if (props.niveau === 'SCHOOL' && (!props.organisationId || !props.ecoleId)) {
      throw new ExceptionScopeInvalide('Une portee SCHOOL exige organisationId et ecoleId.');
    }
    if (
      props.niveau === 'USER'
      && (!props.organisationId || !props.ecoleId || !props.utilisateurId)
    ) {
      throw new ExceptionScopeInvalide(
        'Une portee USER exige organisationId, ecoleId et utilisateurId.',
      );
    }
    return new ConfigurationScope({ ...props });
  }

  /** Cette methode retourne le niveau de portee. */
  public niveau(): NiveauConfiguration {
    return this.props.niveau;
  }

  /** Cette methode retourne la priorite officielle du scope. */
  public priorite(): number {
    return lirePrioriteNiveauConfiguration(this.props.niveau);
  }

  /** Cette methode indique si la portee courante peut surcharger une autre portee. */
  public peutSurcharger(autre: ConfigurationScope): boolean {
    return this.priorite() >= autre.priorite();
  }

  /** Cette methode retourne les proprietes brutes de portee. */
  public valeur(): PorteeConfigurationProps {
    return { ...this.props };
  }
}
