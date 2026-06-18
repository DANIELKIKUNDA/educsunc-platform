import {
  BrandingConfiguration,
  Configuration,
  ConfigurationChange,
  ConfigurationId,
  ConfigurationKey,
  ConfigurationScope,
  ConfigurationValue,
  EffectiveValue,
  ModuleConfiguration,
  NotificationConfiguration,
  RuntimeConfiguration,
} from 'shared/configuration';
import { FIXTURE_CONFIGURATION_RUNTIME, FIXTURE_SCOPE_ECOLE, FIXTURE_SCOPE_SYSTEME } from '../fixtures/ConfigurationFixtures';

// Ce fichier declare les fabriques de domaine Configuration.

export class ConfigurationFactory {
  public static creer(override: Partial<ConstructorParameters<typeof Configuration>[6]> = {}): Configuration {
    return new Configuration(
      ConfigurationId.creer('config-test-1'),
      ConfigurationScope.creer(FIXTURE_SCOPE_SYSTEME),
      ConfigurationKey.creer(FIXTURE_CONFIGURATION_RUNTIME.key),
      ConfigurationValue.creer(FIXTURE_CONFIGURATION_RUNTIME.value),
      'BROUILLON',
      new Date('2026-01-01T00:00:00.000Z'),
      {
        proprietaireNiveau: 'SYSTEM',
        heritable: true,
        overridable: true,
        visiblePour: ['SYSTEM', 'ORGANIZATION', 'SCHOOL', 'USER'],
        auditRequis: true,
        restartRequis: false,
        ...override,
      },
    );
  }

  public static creerChangement(
    type:
      | 'CREATED'
      | 'UPDATED'
      | 'LOCKED'
      | 'UNLOCKED'
      | 'OVERRIDDEN'
      | 'SNAPSHOT_CREATED'
      | 'ROLLBACK_EXECUTED' = 'UPDATED',
  ): ConfigurationChange {
    return new ConfigurationChange({
      type,
      actorId: 'actor-1',
      requestId: 'request-1',
      correlationId: 'correlation-1',
      changedAt: new Date('2026-01-01T00:00:00.000Z'),
      metadata: {},
    });
  }

  public static creerBranding(): BrandingConfiguration {
    return new BrandingConfiguration({
      logoPrincipal: {
        url: 'https://cdn.educsyn.local/logo.svg',
        format: 'SVG',
        actif: true,
      },
      logoSecondaire: undefined,
      couleurPrincipale: '#0055aa',
      couleurSecondaire: '#ffaa00',
      slogan: 'Education claire',
      banniere: 'https://cdn.educsyn.local/banner.png',
      signataires: [
        {
          nom: 'Directeur',
          fonction: 'Direction',
          ordreAffichage: 2,
          actif: true,
        },
        {
          nom: 'Prefet',
          fonction: 'Administration',
          ordreAffichage: 1,
          actif: true,
        },
      ],
      parametresDocumentaires: {
        afficherEnteteSurDocuments: true,
        afficherPiedDePageSurDocuments: true,
        nomEtablissement: 'EducSyn School',
      },
      identiteCommunication: {
        expediteurNom: 'EducSyn',
      },
    });
  }

  public static creerModuleConfiguration(): ModuleConfiguration {
    return new ModuleConfiguration({
      uniteCommerciale: 'SCHOOL',
      plan: 'PREMIUM',
      statutLicence: 'ACTIVE',
      modeEssaiActif: false,
      modulesActifs: ['SCOLARITE_ELEVES', 'PAIEMENTS_FACTURATION'],
      modulesAdditionnels: [],
      featuresActives: ['RUNTIME_RELOAD'],
      featuresParModule: {
        SCOLARITE_ELEVES: [{ feature: 'RUNTIME_RELOAD', statut: 'ACTIVE' }],
      },
      quotas: { users: 500 },
    });
  }

  public static creerNotificationConfiguration(): NotificationConfiguration {
    return new NotificationConfiguration({
      canauxActifs: ['EMAIL', 'IN_APP'],
      budgetsParCanal: { EMAIL: 1000 },
      quotasParCanal: { EMAIL: 500 },
      templatesActifs: ['config-change'],
      preferencesUtilisateurAutorisables: true,
      fallbackCanalAutorise: true,
      brandingCommunicationActif: true,
      fenetresParCanal: [{ canal: 'EMAIL', debut: '08:00', fin: '18:00' }],
      signatureCommunication: 'Equipe EducSyn',
    });
  }

  public static creerRuntimeConfiguration(): RuntimeConfiguration {
    return new RuntimeConfiguration({
      retry: { actif: true, tentativesMaximales: 3, backoffSecondes: 60 },
      replay: { actif: true, tailleLotMaximale: 50 },
      cache: { ttlSecondes: 120, synchronisationActive: true },
      reload: { propagationActive: true, reloadRuntimeActif: true, restartRequisPourClesCritiques: false },
      scheduler: { actif: true, frequenceSecondes: 30 },
    });
  }

  public static creerEffectiveValue(
    key = 'runtime.retry.max',
    value: string | number | boolean | null = 3,
  ): EffectiveValue {
    return new EffectiveValue({
      key: ConfigurationKey.creer(key),
      value: ConfigurationValue.creer(value),
      sourceNiveau: 'SYSTEM',
      herite: false,
      verrouille: false,
      explanation: 'Valeur definie explicitement au niveau SYSTEM.',
    });
  }

  public static scopeEcole(): ConfigurationScope {
    return ConfigurationScope.creer(FIXTURE_SCOPE_ECOLE);
  }
}
