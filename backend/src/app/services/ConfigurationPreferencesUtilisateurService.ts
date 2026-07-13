import {
  type Configuration,
  type EffectiveConfigurationReadModel,
  type UpdateConfigurationUseCase,
} from '../../shared/configuration';
import { ConfigurationInitialisationOfficielleService } from './ConfigurationInitialisationOfficielleService';

export type ThemeUtilisateur = 'light' | 'dark' | 'system';

interface ContextePreferenceUtilisateur {
  readonly utilisateurId: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
}

const CLE_THEME_UTILISATEUR = 'preferences.theme';
const THEMES_UTILISATEUR = new Set<ThemeUtilisateur>(['light', 'dark', 'system']);

/** Orchestre les preferences propres au compte sans imposer un contexte ecole. */
export class ConfigurationPreferencesUtilisateurService {
  constructor(
    private readonly initialisation: ConfigurationInitialisationOfficielleService,
    private readonly listerConfigurations: () => Promise<readonly Configuration[]>,
    private readonly effectiveReadModel: EffectiveConfigurationReadModel,
    private readonly updateUseCase: UpdateConfigurationUseCase,
  ) {}

  public async lireTheme(contexte: ContextePreferenceUtilisateur): Promise<ThemeUtilisateur> {
    await this.amorcer(contexte);
    const effective = await this.effectiveReadModel.trouver(
      this.construirePortee(contexte),
      CLE_THEME_UTILISATEUR,
    );
    const valeur = effective?.valeurs.find((entree) => entree.key === CLE_THEME_UTILISATEUR)?.value;
    return this.normaliserTheme(valeur);
  }

  public async enregistrerTheme(
    contexte: ContextePreferenceUtilisateur,
    theme: unknown,
    trace?: { readonly requestId?: string; readonly correlationId?: string },
  ): Promise<ThemeUtilisateur> {
    const themeNormalise = this.normaliserThemeStrict(theme);
    await this.amorcer(contexte);

    const configurations = await this.listerConfigurations();
    const configuration = configurations.find((entree) => {
      const details = entree.details();
      return (
        details.key === CLE_THEME_UTILISATEUR
        && details.scope.niveau === 'USER'
        && details.scope.utilisateurId === contexte.utilisateurId
      );
    });

    if (!configuration) {
      throw new Error('La preference d affichage du compte n a pas pu etre initialisee.');
    }

    await this.updateUseCase.executer({
      configurationId: configuration.details().identifiant,
      value: themeNormalise,
      actorId: contexte.utilisateurId,
      requestId: trace?.requestId,
      correlationId: trace?.correlationId,
      metadata: { type: 'USER_THEME_UPDATED' },
    });

    return themeNormalise;
  }

  private amorcer(contexte: ContextePreferenceUtilisateur): Promise<{
    readonly createdKeys: readonly string[];
    readonly skippedKeys: readonly string[];
  }> {
    return this.initialisation.amorcerUtilisateur(contexte);
  }

  private construirePortee(contexte: ContextePreferenceUtilisateur) {
    return {
      niveau: 'USER' as const,
      utilisateurId: contexte.utilisateurId,
    };
  }

  private normaliserTheme(value: unknown): ThemeUtilisateur {
    return typeof value === 'string' && THEMES_UTILISATEUR.has(value as ThemeUtilisateur)
      ? value as ThemeUtilisateur
      : 'system';
  }

  private normaliserThemeStrict(value: unknown): ThemeUtilisateur {
    if (typeof value !== 'string' || !THEMES_UTILISATEUR.has(value as ThemeUtilisateur)) {
      throw new Error('Le theme choisi doit etre clair, sombre ou adapte a l appareil.');
    }
    return value as ThemeUtilisateur;
  }
}
