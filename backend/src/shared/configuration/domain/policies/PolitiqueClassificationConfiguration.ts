import { NiveauConfiguration } from '../enums';
import { ExceptionConfigurationIncoherente } from '../exceptions';

export type FamilleClassificationConfiguration =
  | 'CFG-PLAT-RUNTIME'
  | 'CFG-PLAT-NOTIFICATIONS'
  | 'CFG-ORG-POLICIES'
  | 'CFG-ECOLE-MODULES'
  | 'CFG-ECOLE-BRANDING'
  | 'CFG-ECOLE-NOTIFICATIONS'
  | 'CFG-USER-PREFERENCES'
  | 'CFG-PLAT-GENERIC'
  | 'CFG-ORG-GENERIC'
  | 'CFG-ECOLE-SYS-GENERIC'
  | 'CFG-USER-GENERIC';

export interface RegleClassificationConfiguration {
  readonly famille: FamilleClassificationConfiguration;
  readonly proprietaireNiveau: NiveauConfiguration;
  readonly heritableParDefaut: boolean;
  readonly overridableParDefaut: boolean;
  readonly visiblePourParDefaut: readonly NiveauConfiguration[];
  readonly rolesLecture: readonly string[];
  readonly rolesMutation: readonly string[];
}

interface GouvernancePartielleConfiguration {
  readonly proprietaireNiveau?: NiveauConfiguration;
  readonly heritable?: boolean;
  readonly overridable?: boolean;
  readonly visiblePour?: readonly NiveauConfiguration[];
}

export class PolitiqueClassificationConfiguration {
  public classifier(
    key: string,
    niveauHint?: NiveauConfiguration,
  ): RegleClassificationConfiguration {
    if (key.startsWith('runtime.')) {
      return {
        famille: 'CFG-PLAT-RUNTIME',
        proprietaireNiveau: 'SYSTEM',
        heritableParDefaut: false,
        overridableParDefaut: false,
        visiblePourParDefaut: ['SYSTEM'],
        rolesLecture: ['MANAGER_SYSTEME', 'OPERATEUR_SYSTEME', 'SUPPORT_SYSTEME'],
        rolesMutation: ['MANAGER_SYSTEME', 'OPERATEUR_SYSTEME'],
      };
    }

    if (key.startsWith('notifications.preferences.')) {
      return {
        famille: 'CFG-USER-PREFERENCES',
        proprietaireNiveau: 'USER',
        heritableParDefaut: false,
        overridableParDefaut: false,
        visiblePourParDefaut: ['SYSTEM', 'ORGANIZATION', 'SCHOOL', 'USER'],
        rolesLecture: [],
        rolesMutation: [],
      };
    }

    if (
      key.startsWith('notifications.providers.')
      || key.startsWith('notifications.retry.')
      || key.startsWith('notifications.replay.')
      || key.startsWith('notifications.templates.')
      || key.startsWith('notifications.quotas.')
      || key.startsWith('notifications.runtime.')
      || key.startsWith('notifications.monitoring.')
    ) {
      return {
        famille: 'CFG-PLAT-NOTIFICATIONS',
        proprietaireNiveau: 'SYSTEM',
        heritableParDefaut: false,
        overridableParDefaut: false,
        visiblePourParDefaut: ['SYSTEM'],
        rolesLecture: ['MANAGER_SYSTEME', 'OPERATEUR_SYSTEME', 'SUPPORT_SYSTEME'],
        rolesMutation: ['MANAGER_SYSTEME', 'OPERATEUR_SYSTEME'],
      };
    }

    if (
      key === 'modules.allowed'
      || key.startsWith('policies.')
      || key.startsWith('governance.')
      || key.startsWith('limits.')
      || key.startsWith('organization.')
    ) {
      return {
        famille: 'CFG-ORG-POLICIES',
        proprietaireNiveau: 'ORGANIZATION',
        heritableParDefaut: true,
        overridableParDefaut: false,
        visiblePourParDefaut: ['SYSTEM', 'ORGANIZATION', 'SCHOOL'],
        rolesLecture: [
          'PROMOTEUR_ORGANISATION',
          'ADMIN_SYSTEME_ORGANISATION',
          'GESTIONNAIRE_ORGANISATION',
        ],
        rolesMutation: ['PROMOTEUR_ORGANISATION', 'ADMIN_SYSTEME_ORGANISATION'],
      };
    }

    if (key === 'modules.enabled') {
      return {
        famille: 'CFG-ECOLE-MODULES',
        proprietaireNiveau: 'SCHOOL',
        heritableParDefaut: false,
        overridableParDefaut: false,
        visiblePourParDefaut: ['SYSTEM', 'ORGANIZATION', 'SCHOOL'],
        rolesLecture: ['ADMIN_SYSTEME_ECOLE', 'ADMINISTRATEUR_ECOLE'],
        rolesMutation: ['ADMIN_SYSTEME_ECOLE', 'ADMINISTRATEUR_ECOLE'],
      };
    }

    if (key.startsWith('branding.')) {
      return {
        famille: 'CFG-ECOLE-BRANDING',
        proprietaireNiveau: 'SCHOOL',
        heritableParDefaut: false,
        overridableParDefaut: false,
        visiblePourParDefaut: ['SYSTEM', 'ORGANIZATION', 'SCHOOL'],
        rolesLecture: ['ADMIN_SYSTEME_ECOLE', 'ADMINISTRATEUR_ECOLE'],
        rolesMutation: ['ADMIN_SYSTEME_ECOLE'],
      };
    }

    if (key.startsWith('notifications.')) {
      return {
        famille: 'CFG-ECOLE-NOTIFICATIONS',
        proprietaireNiveau: 'SCHOOL',
        heritableParDefaut: false,
        overridableParDefaut: false,
        visiblePourParDefaut: ['SYSTEM', 'ORGANIZATION', 'SCHOOL'],
        rolesLecture: ['ADMIN_SYSTEME_ECOLE', 'ADMINISTRATEUR_ECOLE'],
        rolesMutation: ['ADMIN_SYSTEME_ECOLE', 'ADMINISTRATEUR_ECOLE'],
      };
    }

    if (
      key.startsWith('preferences.')
      || key.startsWith('user.preferences.')
    ) {
      return {
        famille: 'CFG-USER-PREFERENCES',
        proprietaireNiveau: 'USER',
        heritableParDefaut: false,
        overridableParDefaut: false,
        visiblePourParDefaut: ['SYSTEM', 'ORGANIZATION', 'SCHOOL', 'USER'],
        rolesLecture: [],
        rolesMutation: [],
      };
    }

    if (niveauHint === 'SYSTEM') {
      return {
        famille: 'CFG-PLAT-GENERIC',
        proprietaireNiveau: 'SYSTEM',
        heritableParDefaut: false,
        overridableParDefaut: false,
        visiblePourParDefaut: ['SYSTEM'],
        rolesLecture: ['MANAGER_SYSTEME', 'OPERATEUR_SYSTEME', 'SUPPORT_SYSTEME'],
        rolesMutation: ['MANAGER_SYSTEME', 'OPERATEUR_SYSTEME'],
      };
    }

    if (niveauHint === 'ORGANIZATION') {
      return {
        famille: 'CFG-ORG-GENERIC',
        proprietaireNiveau: 'ORGANIZATION',
        heritableParDefaut: true,
        overridableParDefaut: false,
        visiblePourParDefaut: ['SYSTEM', 'ORGANIZATION', 'SCHOOL'],
        rolesLecture: [
          'PROMOTEUR_ORGANISATION',
          'ADMIN_SYSTEME_ORGANISATION',
          'GESTIONNAIRE_ORGANISATION',
        ],
        rolesMutation: ['PROMOTEUR_ORGANISATION', 'ADMIN_SYSTEME_ORGANISATION'],
      };
    }

    if (niveauHint === 'SCHOOL') {
      return {
        famille: 'CFG-ECOLE-SYS-GENERIC',
        proprietaireNiveau: 'SCHOOL',
        heritableParDefaut: false,
        overridableParDefaut: false,
        visiblePourParDefaut: ['SYSTEM', 'ORGANIZATION', 'SCHOOL'],
        rolesLecture: ['ADMIN_SYSTEME_ECOLE', 'ADMINISTRATEUR_ECOLE'],
        rolesMutation: ['ADMIN_SYSTEME_ECOLE', 'ADMINISTRATEUR_ECOLE'],
      };
    }

    return {
      famille: 'CFG-USER-GENERIC',
      proprietaireNiveau: 'USER',
      heritableParDefaut: false,
      overridableParDefaut: false,
      visiblePourParDefaut: ['SYSTEM', 'ORGANIZATION', 'SCHOOL', 'USER'],
      rolesLecture: [],
      rolesMutation: [],
    };
  }

  public normaliserGouvernance(
    key: string,
    niveau: NiveauConfiguration,
    gouvernance?: GouvernancePartielleConfiguration,
  ): Required<GouvernancePartielleConfiguration> {
    const regle = this.classifier(key, niveau);
    this.verifierCompatibiliteNiveau(key, niveau, gouvernance?.proprietaireNiveau);

    return {
      proprietaireNiveau: regle.proprietaireNiveau,
      heritable: gouvernance?.heritable ?? regle.heritableParDefaut,
      overridable: gouvernance?.overridable ?? regle.overridableParDefaut,
      visiblePour: [...(gouvernance?.visiblePour ?? regle.visiblePourParDefaut)],
    };
  }

  public verifierCompatibiliteNiveau(
    key: string,
    niveau: NiveauConfiguration,
    proprietaireNiveau?: NiveauConfiguration,
  ): void {
    const regle = this.classifier(key, niveau);
    if (niveau !== regle.proprietaireNiveau) {
      throw new ExceptionConfigurationIncoherente(
        `La cle ${key} appartient au niveau proprietaire ${regle.proprietaireNiveau} et ne peut pas etre creee au niveau ${niveau}.`,
      );
    }

    if (proprietaireNiveau && proprietaireNiveau !== regle.proprietaireNiveau) {
      throw new ExceptionConfigurationIncoherente(
        `La cle ${key} impose le proprietaire ${regle.proprietaireNiveau}.`,
      );
    }
  }

  public autoriserRole(
    action: 'READ' | 'WRITE',
    roleActif: string | undefined,
    key: string,
    niveauHint?: NiveauConfiguration,
    contexte?: {
      readonly utilisateurId?: string;
      readonly cibleUtilisateurId?: string;
    },
  ): boolean {
    const regle = this.classifier(key, niveauHint);

    if (regle.famille === 'CFG-USER-PREFERENCES' || regle.famille === 'CFG-USER-GENERIC') {
      return Boolean(contexte?.utilisateurId) && contexte?.utilisateurId === contexte?.cibleUtilisateurId;
    }

    const roles = action === 'READ' ? regle.rolesLecture : regle.rolesMutation;
    if (roles.includes(roleActif ?? '')) {
      return true;
    }

    if (
      action === 'WRITE'
      && regle.famille === 'CFG-ECOLE-BRANDING'
      && roleActif === 'ADMINISTRATEUR_ECOLE'
      && this.estSousCleBrandingEditoriale(key)
    ) {
      return true;
    }

    return false;
  }

  private estSousCleBrandingEditoriale(key: string): boolean {
    return [
      'branding.signataires.',
      'branding.documents.',
      'branding.document.',
      'branding.identite.',
      'branding.communication.',
      'branding.slogan',
      'branding.footer.',
      'branding.header.',
    ].some((prefixe) => key.startsWith(prefixe) || key === prefixe.slice(0, -1));
  }
}
