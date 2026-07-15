import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { configurationApi, lireContexteApiConfiguration } from '../../configuration/services/configuration.api';
import { changerOrganisationActiveFrontend } from '../../../shared/auth/session.bootstrap';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { notificationsService } from '../../../services/notifications.service';
import type {
  ConfigurationModuleCatalogItem,
  ConfigurationModuleCode,
  EffectiveConfigurationItem,
} from '../../configuration/models/configuration.model';
import { configurationModuleCatalog } from '../../configuration/models/configuration.model';
import type { OrganizationModulesSectionCard } from '../components/OrganizationModulesSection.vue';
import type { OrganisationHistoryItem } from '../models/organization-governance.model';
import { organizationGovernanceApi } from '../services/organization-governance.api';
import { useOrganizationGovernanceStore } from '../stores/organization-governance.store';

type OrganisationDetailTab = 'general' | 'responsable' | 'modules' | 'ecoles' | 'historique';

export function useOrganizationDetailViewModel() {
  const route = useRoute();
  const router = useRouter();
  const store = useOrganizationGovernanceStore();
  const schoolCount = ref(0);
  const togglingStatus = ref(false);
  const statusDialogOpen = ref(false);
  const activeTab = ref<OrganisationDetailTab>('general');
  const totalUtilisateursActifs = ref<number | null>(null);
  const responsablePrincipalEtatCompte = ref<string | null>(null);
  const modulesOrganisation = ref<readonly ConfigurationModuleCode[]>([]);
  const historiqueOrganisation = ref<readonly OrganisationHistoryItem[]>([]);
  const moduleCatalog = ref<readonly ConfigurationModuleCatalogItem[]>(configurationModuleCatalog);
  const modulesDraft = ref<ConfigurationModuleCode[]>([]);
  const modulesStatus = ref<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const modulesMutationStatus = ref<'idle' | 'loading'>('idle');
  const modulesErrorMessage = ref<string | null>(null);
  const modulesConfirmDialogOpen = ref(false);

  const organisationId = computed(() =>
    typeof route.params.idOrganisation === 'string' ? route.params.idOrganisation : '',
  );

  const organisation = computed(() => store.state.selectedOrganisation);
  const ecoles = computed(() => store.state.ecoles);
  const isLoading = computed(() => store.state.status === 'loading');
  const errorMessage = computed(() => traduireMessageErreur(store.state.errorMessage));
  const isBusy = computed(() => store.state.mutationStatus === 'loading' || togglingStatus.value);
  const modulesCards = computed<readonly OrganizationModulesSectionCard[]>(() =>
    moduleCatalog.value.map((module) => ({
      code: module.code,
      label: module.label,
      description: module.description,
      helper: modulesDraft.value.includes(module.code)
        ? 'Autorise pour les ecoles de cette organisation.'
        : 'Disponible pour attribution a cette organisation.',
      stateLabel: modulesDraft.value.includes(module.code) ? 'Autorise' : 'Disponible',
    })),
  );
  const modulesSelectionSummary = computed(() => {
    const count = modulesDraft.value.length;
    if (count === 0) {
      return 'Aucun module autorise pour le moment.';
    }

    return count === 1
      ? '1 module autorise actuellement.'
      : `${count} modules autorises actuellement.`;
  });
  const canSaveModules = computed(() =>
    modulesMutationStatus.value !== 'loading'
    && modulesStatus.value !== 'loading'
    && !areModuleListsEqual(modulesDraft.value, modulesOrganisation.value),
  );
  const infoRapide = computed(() => [
    { label: 'Version', value: organisation.value ? `v${organisation.value.version}` : 'Non renseignee' },
    { label: 'Statut', value: organisation.value ? (organisation.value.actif ? 'Active' : 'Inactive') : 'Non renseigne' },
    { label: 'Creee il y a', value: lireCreeDepuis() },
    { label: 'Nombre d ecoles', value: String(schoolCount.value) },
    { label: 'Nombre d utilisateurs', value: totalUtilisateursActifs.value === null ? 'Non renseigne' : String(totalUtilisateursActifs.value) },
  ]);
  const historique = computed(() =>
    historiqueOrganisation.value.map((evenement) => ({
      id: evenement.id,
      titre: traduireTitreHistorique(evenement.action),
      description: traduireDescriptionHistorique(evenement),
      auteur: evenement.acteur?.trim() || 'Systeme',
      date: evenement.creeLe,
    }))
  );

  const stats = computed(() => ({
    ecoles: schoolCount.value,
    utilisateurs: totalUtilisateursActifs.value === null ? 'Non renseigne' : String(totalUtilisateursActifs.value),
    modules: modulesOrganisation.value.length > 0 ? String(modulesOrganisation.value.length) : 'Aucun',
    derniereModification: lireDerniereModification(),
  }));

  async function chargerOrganisation(): Promise<void> {
    if (!organisationId.value) {
      return;
    }

    await store.chargerOrganisation(organisationId.value);
    await store.chargerEcolesParOrganisation(organisationId.value, 1, 20);
    schoolCount.value = store.state.ecolesPagination?.total ?? store.state.ecoles.length;
    await chargerIndicateursOrganisation();
    await chargerCatalogueModules();
    await chargerModulesOrganisation();
    await chargerHistoriqueOrganisation();
  }

  async function activerOrganisationDansContexte(): Promise<void> {
    if (!organisation.value) return;
    await changerOrganisationActiveFrontend(organisation.value.id);
    activeContextStore.setGovernanceLevel('ORGANISATION');
    notificationsService.succes('Contexte active', `${organisation.value.nom} est maintenant l organisation active.`);
  }

  async function ouvrirEdition(): Promise<void> {
    if (!organisation.value) return;
    await router.push(`/app/organisation/organisations/${organisation.value.id}/modifier`);
  }

  async function retournerRegistre(): Promise<void> {
    await router.push('/app/organisation/ecoles');
  }

  function ouvrirDialogueStatut(): void {
    statusDialogOpen.value = true;
    store.reinitialiserMessages();
  }

  function fermerDialogueStatut(): void {
    statusDialogOpen.value = false;
    togglingStatus.value = false;
    store.reinitialiserMessages();
  }

  async function confirmerChangementStatut(): Promise<void> {
    if (!organisation.value) return;
    togglingStatus.value = true;
    const etaitActive = organisation.value.actif;

    if (etaitActive) {
      await store.desactiverOrganisation(organisation.value.id);
    } else {
      await store.activerOrganisation(organisation.value.id);
    }

    togglingStatus.value = false;

    if (store.state.status === 'ready') {
      statusDialogOpen.value = false;
      notificationsService.succes(
        'Organisation mise a jour avec succes',
        etaitActive
          ? `${organisation.value.nom} a ete desactivee avec succes.`
          : `${organisation.value.nom} a ete activee avec succes.`,
      );
      await chargerOrganisation();
      return;
    }

    notificationsService.danger(
      'Une erreur est survenue pendant l operation.',
      'Impossible de mettre a jour le statut de cette organisation. Veuillez reessayer.',
    );
  }

  function lirePromoteurPrincipal(): string {
    return organisation.value?.promoteurPrincipal?.nomComplet?.trim()
      || organisation.value?.creePar?.trim()
      || 'Non renseigne';
  }

  function lireVersion(): string {
    if (!organisation.value) {
      return 'Non renseignee';
    }

    return `v${organisation.value.version}`;
  }

  function lireDerniereModification(): string {
    return formaterDate(organisation.value?.modifieLe ?? organisation.value?.creeLe, true);
  }

  function lireEtatCompteResponsable(): string {
    return responsablePrincipalEtatCompte.value ?? 'Non renseigne';
  }

  function lireDescriptionOrganisation(): string {
    return organisation.value?.description?.trim() || 'Aucune description renseignee pour cette organisation.';
  }

  function lireCreeDepuis(): string {
    if (!organisation.value?.creeLe) {
      return 'Non renseigne';
    }

    const reference = new Date(organisation.value.creeLe);
    if (Number.isNaN(reference.getTime())) {
      return 'Non renseigne';
    }

    const maintenant = new Date();
    const diffMs = maintenant.getTime() - reference.getTime();
    const diffJours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    if (diffJours === 0) return 'Aujourd hui';
    if (diffJours === 1) return 'Il y a 1 jour';
    if (diffJours < 30) return `Il y a ${diffJours} jours`;

    const diffMois = Math.floor(diffJours / 30);
    if (diffMois === 1) return 'Il y a 1 mois';
    if (diffMois < 12) return `Il y a ${diffMois} mois`;

    const diffAnnees = Math.floor(diffMois / 12);
    return diffAnnees === 1 ? 'Il y a 1 an' : `Il y a ${diffAnnees} ans`;
  }

  function selectionnerOnglet(tab: OrganisationDetailTab): void {
    if (tab === 'ecoles' && organisationId.value) {
      void router.push(`/app/organisation/organisations/${organisationId.value}/ecoles`);
      return;
    }

    activeTab.value = tab;
    void router.replace({
      query: {
        ...route.query,
        tab,
      },
    });
  }

  function ouvrirConfigurationModules(): void {
    selectionnerOnglet('modules');
  }

  function demanderEnregistrementModules(): void {
    if (!canSaveModules.value) {
      return;
    }

    modulesConfirmDialogOpen.value = true;
  }

  function fermerDialogueModules(): void {
    modulesConfirmDialogOpen.value = false;
  }

  async function confirmerEnregistrementModules(): Promise<void> {
    if (!organisation.value || modulesMutationStatus.value === 'loading') {
      return;
    }

    modulesMutationStatus.value = 'loading';
    modulesErrorMessage.value = null;

    try {
      await configurationApi.configurerModulesOrganisation(
        organisation.value.id,
        {
          modules: modulesDraft.value,
        },
        lireContexteApiConfiguration(),
      );
      modulesOrganisation.value = [...modulesDraft.value];
      modulesConfirmDialogOpen.value = false;
      notificationsService.succes(
        'Modules autorises mis a jour',
        `${organisation.value.nom} a bien enregistre sa nouvelle attribution de modules.`,
      );
    } catch {
      modulesErrorMessage.value = "Les modules autorises n'ont pas pu etre enregistres. Votre selection a ete conservee.";
      notificationsService.danger(
        'Enregistrement impossible',
        "Les modules autorises n'ont pas pu etre enregistres pour cette organisation.",
      );
    } finally {
      modulesMutationStatus.value = 'idle';
    }
  }

  function traduireMessageErreur(message: string | null): string | null {
    if (!message) {
      return null;
    }

    return 'Impossible de charger les informations de l organisation. Veuillez reessayer.';
  }

  async function chargerIndicateursOrganisation(): Promise<void> {
    if (!organisationId.value) {
      return;
    }

    try {
      const response = await organizationGovernanceApi.consulterIndicateursOrganisation(organisationId.value);
      totalUtilisateursActifs.value = response.donnee.totalUtilisateursActifs;
      responsablePrincipalEtatCompte.value = response.donnee.responsablePrincipal?.etatCompte ?? null;
    } catch {
      totalUtilisateursActifs.value = null;
      responsablePrincipalEtatCompte.value = null;
    }
  }

  async function chargerHistoriqueOrganisation(): Promise<void> {
    if (!organisationId.value) {
      historiqueOrganisation.value = [];
      return;
    }

    try {
      const response = await organizationGovernanceApi.consulterHistoriqueOrganisation(organisationId.value);
      historiqueOrganisation.value = response.donnee.evenements;
    } catch {
      historiqueOrganisation.value = creerHistoriqueFallback();
    }
  }

  async function chargerModulesOrganisation(): Promise<void> {
    if (!organisationId.value) {
      modulesOrganisation.value = [];
      modulesDraft.value = [];
      return;
    }

    modulesStatus.value = 'loading';
    modulesErrorMessage.value = null;

    try {
      const response = await configurationApi.consulterConfigurationEffective(
        {
          niveau: 'ORGANIZATION',
          organisationId: organisationId.value,
          keyPrefix: 'modules',
        },
        lireContexteApiConfiguration(),
      );
      modulesOrganisation.value = extraireModulesAutorises(response.donnees);
      modulesDraft.value = [...modulesOrganisation.value];
      modulesStatus.value = 'ready';
    } catch {
      modulesOrganisation.value = [];
      modulesDraft.value = [];
      modulesStatus.value = 'error';
      modulesErrorMessage.value = "Impossible de relire les modules autorises pour cette organisation.";
    }
  }

  async function chargerCatalogueModules(): Promise<void> {
    try {
      const response = await configurationApi.consulterCatalogueModules(lireContexteApiConfiguration());
      moduleCatalog.value = response.donnees.modules.length > 0
        ? response.donnees.modules
        : configurationModuleCatalog;
    } catch {
      moduleCatalog.value = configurationModuleCatalog;
    }
  }

  function extraireModulesAutorises(configuration: EffectiveConfigurationItem | null): readonly ConfigurationModuleCode[] {
    if (!configuration) {
      return moduleCatalog.value.map((module) => module.code);
    }

    const entree = configuration.valeurs.find((valeur) => valeur.key === 'modules.allowed');
    if (!entree || !Array.isArray(entree.value)) {
      return moduleCatalog.value.map((module) => module.code);
    }

    return entree.value.filter(
      (module): module is ConfigurationModuleCode =>
        typeof module === 'string'
        && moduleCatalog.value.some((item) => item.code === module),
    );
  }

  function definirModulesOrganisation(valeur: string[]): void {
    modulesDraft.value = valeur.filter(
      (module): module is ConfigurationModuleCode =>
        moduleCatalog.value.some((item) => item.code === module),
    );
  }

  function creerHistoriqueFallback(): readonly OrganisationHistoryItem[] {
    if (!organisation.value) {
      return [];
    }

    return [
      {
        id: `${organisation.value.id}-fallback-creation`,
        action: 'CREER_ORGANISATION',
        acteur: organisation.value.creePar,
        description: 'Organisation creee',
        creeLe: organisation.value.creeLe,
        details: {
          nom: organisation.value.nom,
          source: 'frontend-fallback',
        },
      },
    ];
  }

  function traduireTitreHistorique(action: string): string {
    switch (action) {
      case 'CREER_ORGANISATION':
        return 'Organisation creee';
      case 'RENOMMER_ORGANISATION':
        return 'Organisation renommee';
      case 'METTRE_A_JOUR_ORGANISATION':
        return 'Organisation mise a jour';
      case 'ACTIVER_ORGANISATION':
        return 'Organisation activee';
      case 'DESACTIVER_ORGANISATION':
        return 'Organisation desactivee';
      default:
        return 'Evenement organisation';
    }
  }

  function traduireDescriptionHistorique(evenement: OrganisationHistoryItem): string {
    const nomOrganisation =
      typeof evenement.details?.nom === 'string' && evenement.details.nom.trim().length > 0
        ? evenement.details.nom.trim()
        : organisation.value?.nom ?? 'cette organisation';
    const ancienNom =
      typeof evenement.details?.ancienNom === 'string' ? evenement.details.ancienNom : undefined;
    const nouveauNom =
      typeof evenement.details?.nouveauNom === 'string' ? evenement.details.nouveauNom : undefined;

    switch (evenement.action) {
      case 'CREER_ORGANISATION':
        return `${nomOrganisation} a ete enregistree dans la plateforme.`;
      case 'RENOMMER_ORGANISATION':
        return ancienNom && nouveauNom
          ? `Le nom est passe de ${ancienNom} a ${nouveauNom}.`
          : `${nomOrganisation} a ete renommee.`;
      case 'METTRE_A_JOUR_ORGANISATION':
        return `${nomOrganisation} a ete mise a jour avec ses informations les plus recentes.`;
      case 'ACTIVER_ORGANISATION':
        return `${nomOrganisation} a ete reactivee dans la plateforme.`;
      case 'DESACTIVER_ORGANISATION':
        return `${nomOrganisation} a ete suspendue dans la plateforme.`;
      default:
        return evenement.description || 'Evenement organisation.';
    }
  }

  function formaterDate(value?: string, withTime = false): string {
    if (!value) return 'Non renseignee';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    }).format(date);
  }

  onMounted(async () => {
    const tabFromQuery = typeof route.query.tab === 'string' ? route.query.tab : '';
    if (
      tabFromQuery === 'general'
      || tabFromQuery === 'responsable'
      || tabFromQuery === 'modules'
      || tabFromQuery === 'ecoles'
      || tabFromQuery === 'historique'
    ) {
      if (tabFromQuery === 'ecoles') {
        await router.replace(`/app/organisation/organisations/${organisationId.value}/ecoles`);
        return;
      }
      activeTab.value = tabFromQuery;
    }

    await chargerOrganisation();
  });

  return {
    organisation,
    ecoles,
    isLoading,
    errorMessage,
    isBusy,
    stats,
    activeTab,
    infoRapide,
    historique,
    modulesCards,
    modulesDraft,
    modulesStatus,
    modulesMutationStatus,
    modulesErrorMessage,
    modulesSelectionSummary,
    canSaveModules,
    modulesConfirmDialogOpen,
    statusDialogOpen,
    chargerOrganisation,
    activerOrganisationDansContexte,
    ouvrirEdition,
    retournerRegistre,
    ouvrirDialogueStatut,
    fermerDialogueStatut,
    confirmerChangementStatut,
    selectionnerOnglet,
    ouvrirConfigurationModules,
    demanderEnregistrementModules,
    fermerDialogueModules,
    confirmerEnregistrementModules,
    definirModulesOrganisation,
    lirePromoteurPrincipal,
    lireVersion,
    lireDescriptionOrganisation,
    lireDerniereModification,
    lireEtatCompteResponsable,
    lireCreeDepuis,
    formaterDate,
  };
}

function areModuleListsEqual(
  current: readonly ConfigurationModuleCode[],
  reference: readonly ConfigurationModuleCode[],
): boolean {
  if (current.length !== reference.length) {
    return false;
  }

  const left = [...current].sort();
  const right = [...reference].sort();
  return left.every((value, index) => value === right[index]);
}
