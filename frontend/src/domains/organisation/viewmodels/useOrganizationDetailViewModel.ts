import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { configurationApi, lireContexteApiConfiguration } from '../../configuration/services/configuration.api';
import { changerOrganisationActiveFrontend } from '../../../shared/auth/session.bootstrap';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { notificationsService } from '../../../services/notifications.service';
import type { ConfigurationModuleCode, EffectiveConfigurationItem } from '../../configuration/models/configuration.model';
import { configurationModuleCatalog } from '../../configuration/models/configuration.model';
import type { OrganisationHistoryItem } from '../models/organization-governance.model';
import { organizationGovernanceApi } from '../services/organization-governance.api';
import { useOrganizationGovernanceStore } from '../stores/organization-governance.store';

type OrganisationDetailTab = 'general' | 'responsable' | 'ecoles' | 'historique';

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
  const modulesParEcole = ref<Record<string, readonly ConfigurationModuleCode[]>>({});
  const historiqueOrganisation = ref<readonly OrganisationHistoryItem[]>([]);

  const organisationId = computed(() =>
    typeof route.params.idOrganisation === 'string' ? route.params.idOrganisation : '',
  );

  const organisation = computed(() => store.state.selectedOrganisation);
  const ecoles = computed(() => store.state.ecoles);
  const isLoading = computed(() => store.state.status === 'loading');
  const errorMessage = computed(() => traduireMessageErreur(store.state.errorMessage));
  const isBusy = computed(() => store.state.mutationStatus === 'loading' || togglingStatus.value);
  const ecolesApercu = computed(() => ecoles.value.slice(0, 5));
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
    modules: modulesOrganisation.value.length > 0 ? String(modulesOrganisation.value.length) : 'Non renseigne',
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
    await chargerModulesOrganisation();
    await chargerModulesParEcole();
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

  function ouvrirActionResponsable(action: string): void {
    notificationsService.info(
      'Action sensible non disponible.',
      `${action} sera disponible depuis cette fiche des qu elle sera ouverte.`,
    );
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

  function lireSectionsOrganisees(): string {
    return 'Non renseigne';
  }

  function lireModulesActives(idEcole?: string): string {
    if (!idEcole) {
      return modulesOrganisation.value.length > 0
        ? modulesOrganisation.value.map((module) => lireLibelleModule(module)).join(', ')
        : 'Non renseigne';
    }

    const modules = modulesParEcole.value[idEcole] ?? [];
    if (modules.length === 0) {
      return 'Non renseigne';
    }

    return modules.map((module) => lireLibelleModule(module)).join(', ');
  }

  function selectionnerOnglet(tab: OrganisationDetailTab): void {
    activeTab.value = tab;
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
      return;
    }

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
    } catch {
      modulesOrganisation.value = [];
    }
  }

  async function chargerModulesParEcole(): Promise<void> {
    if (!organisationId.value || ecoles.value.length === 0) {
      modulesParEcole.value = {};
      return;
    }

    const entries = await Promise.all(
      ecoles.value.map(async (ecole) => {
        try {
          const response = await configurationApi.resoudreModulesEffectifs(
            { organisationId: organisationId.value, ecoleId: ecole.id },
            lireContexteApiConfiguration(),
          );
          return [ecole.id, response.donnees.modulesEffectifs] as const;
        } catch {
          return [ecole.id, []] as const;
        }
      }),
    );

    modulesParEcole.value = Object.fromEntries(entries);
  }

  function extraireModulesAutorises(configuration: EffectiveConfigurationItem | null): readonly ConfigurationModuleCode[] {
    if (!configuration) {
      return [];
    }

    const entree = configuration.valeurs.find((valeur) => valeur.key === 'modules.allowed');
    if (!entree || !Array.isArray(entree.value)) {
      return [];
    }

    return entree.value.filter(
      (module): module is ConfigurationModuleCode =>
        typeof module === 'string'
        && configurationModuleCatalog.some((item) => item.code === module),
    );
  }

  function lireLibelleModule(code: ConfigurationModuleCode): string {
    return configurationModuleCatalog.find((module) => module.code === code)?.label ?? code;
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
    await chargerOrganisation();
  });

  return {
    organisation,
    ecoles,
    ecolesApercu,
    isLoading,
    errorMessage,
    isBusy,
    stats,
    activeTab,
    infoRapide,
    historique,
    statusDialogOpen,
    chargerOrganisation,
    activerOrganisationDansContexte,
    ouvrirActionResponsable,
    ouvrirEdition,
    retournerRegistre,
    ouvrirDialogueStatut,
    fermerDialogueStatut,
    confirmerChangementStatut,
    selectionnerOnglet,
    lirePromoteurPrincipal,
    lireVersion,
    lireDescriptionOrganisation,
    lireDerniereModification,
    lireEtatCompteResponsable,
    lireCreeDepuis,
    lireSectionsOrganisees,
    lireModulesActives,
    formaterDate,
  };
}
