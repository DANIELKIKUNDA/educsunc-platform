import type {
  CreateConfigurationUseCase,
  GetConfigurationUseCase,
  GetEffectiveConfigurationUseCase,
  LockConfigurationUseCase,
  OverrideConfigurationUseCase,
  UnlockConfigurationUseCase,
  UpdateConfigurationUseCase,
  DeleteConfigurationUseCase,
} from '../../../../configuration/application';
import {
  envelopperReponseHttpConfiguration,
  enrichirContexteHttpConfiguration,
  extraireContexteHttpConfiguration,
} from './ConfigurationControllerSupport';
import type {
  ReponseControleurHttpConfiguration,
  RequeteHttpConfiguration,
} from './HttpConfigurationControllerTypes';
import {
  PresentateurHttpConfiguration,
  PresentateurHttpEffectiveConfiguration,
} from '../presenters';
import {
  ValidateurHttpCreateConfiguration,
  ValidateurHttpDeleteConfiguration,
  ValidateurHttpLockConfiguration,
  ValidateurHttpOverrideConfiguration,
  ValidateurHttpUnlockConfiguration,
  ValidateurHttpUpdateConfiguration,
} from '../validators';

// Ce fichier declare le controller HTTP principal de Configuration.

export class ControleurConfigurationHttp {
  constructor(
    private readonly createConfigurationUseCase: CreateConfigurationUseCase,
    private readonly updateConfigurationUseCase: UpdateConfigurationUseCase,
    private readonly deleteConfigurationUseCase: DeleteConfigurationUseCase,
    private readonly lockConfigurationUseCase: LockConfigurationUseCase,
    private readonly unlockConfigurationUseCase: UnlockConfigurationUseCase,
    private readonly getConfigurationUseCase: GetConfigurationUseCase,
    private readonly getEffectiveConfigurationUseCase: GetEffectiveConfigurationUseCase,
    private readonly overrideConfigurationUseCase: OverrideConfigurationUseCase,
  ) {}

  public async creer(
    requete: RequeteHttpConfiguration<unknown>,
  ): Promise<ReponseControleurHttpConfiguration<ReturnType<typeof PresentateurHttpConfiguration.presenter>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpConfiguration(requete);
    const commande = enrichirContexteHttpConfiguration(
      ValidateurHttpCreateConfiguration.valider(requete.body),
      contexte,
    );
    const resultat = await this.createConfigurationUseCase.executer(commande);
    return envelopperReponseHttpConfiguration(
      PresentateurHttpConfiguration.presenter(resultat),
      contexte,
      commenceLe,
      201,
    );
  }

  public async mettreAJour(
    requete: RequeteHttpConfiguration<unknown, { id?: string }>,
  ): Promise<ReponseControleurHttpConfiguration<ReturnType<typeof PresentateurHttpConfiguration.presenter>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpConfiguration(requete);
    const commande = enrichirContexteHttpConfiguration(
      ValidateurHttpUpdateConfiguration.valider(requete.params ?? {}, requete.body),
      contexte,
    );
    const resultat = await this.updateConfigurationUseCase.executer(commande);
    return envelopperReponseHttpConfiguration(
      PresentateurHttpConfiguration.presenter(resultat),
      contexte,
      commenceLe,
    );
  }

  public async supprimer(
    requete: RequeteHttpConfiguration<{ actorId?: string; raison?: string }, { id?: string }>,
  ): Promise<ReponseControleurHttpConfiguration<{ configurationId: string; supprime: true }>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpConfiguration(requete);
    const commande = enrichirContexteHttpConfiguration(
      ValidateurHttpDeleteConfiguration.valider(requete.params ?? {}, requete.body),
      contexte,
    );
    await this.deleteConfigurationUseCase.executer(commande);
    return envelopperReponseHttpConfiguration(
      {
        configurationId: commande.configurationId,
        supprime: true,
      },
      contexte,
      commenceLe,
    );
  }

  public async verrouiller(
    requete: RequeteHttpConfiguration<{
      niveauMinimalAutorise: import('../../../../configuration/domain').NiveauConfiguration;
      actorId: string;
      raison?: string;
    }, { id?: string }>,
  ): Promise<ReponseControleurHttpConfiguration<ReturnType<typeof PresentateurHttpConfiguration.presenter>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpConfiguration(requete);
    const commande = enrichirContexteHttpConfiguration(
      ValidateurHttpLockConfiguration.valider(requete.params ?? {}, requete.body!),
      contexte,
    );
    const resultat = await this.lockConfigurationUseCase.executer(commande);
    return envelopperReponseHttpConfiguration(
      PresentateurHttpConfiguration.presenter(resultat),
      contexte,
      commenceLe,
    );
  }

  public async deverrouiller(
    requete: RequeteHttpConfiguration<{ actorId?: string }, { id?: string }>,
  ): Promise<ReponseControleurHttpConfiguration<ReturnType<typeof PresentateurHttpConfiguration.presenter>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpConfiguration(requete);
    const commande = enrichirContexteHttpConfiguration(
      ValidateurHttpUnlockConfiguration.valider(requete.params ?? {}, requete.body),
      contexte,
    );
    const resultat = await this.unlockConfigurationUseCase.executer(commande);
    return envelopperReponseHttpConfiguration(
      PresentateurHttpConfiguration.presenter(resultat),
      contexte,
      commenceLe,
    );
  }

  public async consulterParId(
    requete: RequeteHttpConfiguration<never, { id?: string }>,
  ): Promise<ReponseControleurHttpConfiguration<ReturnType<typeof PresentateurHttpConfiguration.presenter>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpConfiguration(requete);
    const resultat = await this.getConfigurationUseCase.executer({
      configurationId: requete.params?.id ?? '',
    });
    return envelopperReponseHttpConfiguration(
      PresentateurHttpConfiguration.presenter(resultat),
      contexte,
      commenceLe,
    );
  }

  public async consulterEffective(
    requete: RequeteHttpConfiguration<
      never,
      never,
      {
        niveau?: import('../../../../configuration/domain').NiveauConfiguration;
        organisationId?: string;
        ecoleId?: string;
        utilisateurId?: string;
        keyPrefix?: string;
      }
    >,
  ): Promise<ReponseControleurHttpConfiguration<ReturnType<typeof PresentateurHttpEffectiveConfiguration.presenter>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpConfiguration(requete);
    const query = requete.query ?? {};
    const resultat = await this.getEffectiveConfigurationUseCase.executer({
      scope: {
        niveau: query.niveau ?? 'SYSTEM',
        organisationId: query.organisationId,
        ecoleId: query.ecoleId,
        utilisateurId: query.utilisateurId,
      },
      keyPrefix: query.keyPrefix,
    });
    return envelopperReponseHttpConfiguration(
      PresentateurHttpEffectiveConfiguration.presenter(resultat),
      contexte,
      commenceLe,
    );
  }

  public async surcharger(
    requete: RequeteHttpConfiguration<unknown, { id?: string }>,
  ): Promise<ReponseControleurHttpConfiguration<ReturnType<typeof PresentateurHttpConfiguration.presenter>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpConfiguration(requete);
    const commande = enrichirContexteHttpConfiguration(
      ValidateurHttpOverrideConfiguration.valider(requete.params ?? {}, requete.body),
      contexte,
    );
    const resultat = await this.overrideConfigurationUseCase.executer(commande);
    return envelopperReponseHttpConfiguration(
      PresentateurHttpConfiguration.presenter(resultat),
      contexte,
      commenceLe,
    );
  }
}
