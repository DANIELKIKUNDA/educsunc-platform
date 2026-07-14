import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { changerEcoleActiveFrontend, changerOrganisationActiveFrontend } from '../../../shared/auth/session.bootstrap';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { notificationsService } from '../../../services/notifications.service';
import type { EcoleItem } from '../models/organization-governance.model';
import { useOrganizationGovernanceStore } from '../stores/organization-governance.store';

const TAILLE_PAGE = 12;

export function useOrganizationAttachedSchoolsViewModel() {
  const route = useRoute();
  const router = useRouter();
  const store = useOrganizationGovernanceStore();
  const { canAccessPage, canUseAction } = useDoctrineAccess();

  const searchTerm = ref('');
  const statusFilter = ref('');
  const selectedSchool = ref<EcoleItem | null>(null);
  const statusDialogOpen = ref(false);
  const pageCourante = ref(1);
  const chargementSupplementaire = ref(false);
  const toutCharge = ref(false);
  const sentinelElement = ref<HTMLElement | null>(null);
  const observer = ref<IntersectionObserver | null>(null);
  const showBackToTop = ref(false);

  const organisationId = computed(() =>
    typeof route.params.idOrganisation === 'string' ? route.params.idOrganisation : '',
  );

  const organisation = computed(() => store.state.selectedOrganisation);
  const ecoles = computed(() => store.state.ecoles);
  const isLoading = computed(() => store.state.status === 'loading' && store.state.ecoles.length === 0);
  const isBusy = computed(() => store.state.mutationStatus === 'loading' || chargementSupplementaire.value);
  const errorMessage = computed(() => traduireMessageErreur(store.state.errorMessage));
  const canCreateSchool = computed(() => canUseAction('referentiel.write', 'ADM-001'));
  const canViewSchool = computed(() => canUseAction('organization.school.detail.read', 'ORG-001-SCHOOLS') || canAccessPage('ORG-002'));
  const canConfigureSchool = computed(() => canAccessPage('CFG-ECO-001'));
  const canToggleSchoolStatus = computed(() => canUseAction('referentiel.write', 'ADM-002'));
  const canOpenSchoolWorkspace = computed(() => canAccessPage('ADM-002'));

  const availableStatuses = computed(() => {
    const statuses = new Set<string>();
    store.state.ecoles.forEach((ecole) => statuses.add(ecole.actif ? 'ACTIVE' : 'INACTIVE'));
    return [...statuses];
  });

  const filteredSchools = computed(() => {
    const term = searchTerm.value.trim().toLowerCase();
    return ecoles.value.filter((ecole) => {
      const matchesSearch = term.length === 0
        || ecole.nom.toLowerCase().includes(term)
        || ecole.code.toLowerCase().includes(term);
      const matchesStatus = statusFilter.value.length === 0
        || (statusFilter.value === 'ACTIVE' ? ecole.actif : !ecole.actif);
      return matchesSearch && matchesStatus;
    });
  });

  const stats = computed(() => ({
    total: store.state.ecolesPagination?.total ?? ecoles.value.length,
    active: ecoles.value.filter((ecole) => ecole.actif).length,
    inactive: ecoles.value.filter((ecole) => !ecole.actif).length,
    modules: 'Non renseigne',
  }));

  function formaterDate(value?: string): string {
    if (!value) return 'Non renseignee';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  function traduireMessageErreur(message: string | null): string | null {
    if (!message) {
      return null;
    }

    const lower = message.toLowerCase();

    if (lower.includes('session') || lower.includes('token') || lower.includes('401') || lower.includes('auth')) {
      return "Impossible d'ouvrir les ecoles rattachees avec la session courante. Verifiez la session active puis reessayez.";
    }

    if (lower.includes('permission') || lower.includes('forbidden') || lower.includes('403') || lower.includes('autorise')) {
      return "Le role courant ne peut pas consulter ces ecoles dans le perimetre actuellement selectionne.";
    }

    if (lower.includes('fetch') || lower.includes('network') || lower.includes('serveur') || lower.includes('connexion')) {
      return "La liste des ecoles n'a pas pu etre chargee pour le moment. Reessayez dans un instant.";
    }

    return "Impossible de charger les ecoles rattachees a cette organisation pour le moment.";
  }

  function lireSectionsOrganisees(): string {
    return 'Non renseigné';
  }

  function lireModulesActives(): string {
    return 'Non renseigné';
  }

  async function chargerOrganisationEtPremierePage(): Promise<void> {
    if (!organisationId.value) return;
    pageCourante.value = 1;
    toutCharge.value = false;
    await store.chargerOrganisation(organisationId.value);
    await store.chargerEcolesParOrganisation(organisationId.value, 1, TAILLE_PAGE, false);
    recalculerFinChargement();
  }

  function recalculerFinChargement(): void {
    const pagination = store.state.ecolesPagination;
    if (!pagination) {
      toutCharge.value = true;
      return;
    }

    toutCharge.value = pageCourante.value >= pagination.totalPages || store.state.ecoles.length >= pagination.total;
  }

  async function chargerPageSuivante(): Promise<void> {
    if (!organisationId.value || chargementSupplementaire.value || toutCharge.value) {
      return;
    }

    const pagination = store.state.ecolesPagination;
    if (!pagination || pageCourante.value >= pagination.totalPages) {
      toutCharge.value = true;
      return;
    }

    chargementSupplementaire.value = true;
    pageCourante.value += 1;
    await store.chargerEcolesParOrganisation(organisationId.value, pageCourante.value, TAILLE_PAGE, true);
    chargementSupplementaire.value = false;
    recalculerFinChargement();
  }

  function brancherInfiniteScroll(): void {
    if (observer.value) {
      observer.value.disconnect();
    }

    observer.value = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting) {
        void chargerPageSuivante();
      }
    }, { rootMargin: '200px 0px 200px 0px' });

    if (sentinelElement.value) {
      observer.value.observe(sentinelElement.value);
    }
  }

  function gererScrollFenetre(): void {
    showBackToTop.value = window.scrollY > 720;
  }

  async function revenirOrganisation(): Promise<void> {
    if (!organisationId.value) {
      await router.push('/app/organisation/ecoles');
      return;
    }

    await router.push(`/app/organisation/organisations/${organisationId.value}`);
  }

  async function revenirRegistre(): Promise<void> {
    await router.push('/app/organisation/ecoles');
  }

  async function voirEcole(idEcole: string): Promise<void> {
    await router.push({
      name: 'school-administration-detail',
      params: { idEcole },
      query: { retour: `/app/organisation/organisations/${organisationId.value}/ecoles` },
    });
  }

  async function configurerEcole(ecole: EcoleItem): Promise<void> {
    await changerOrganisationActiveFrontend(ecole.idOrganisation);
    await changerEcoleActiveFrontend(ecole.id);
    activeContextStore.setGovernanceLevel('ECOLE');
    await router.push('/app/configuration/ecole/modules');
  }

  async function ouvrirEcole(ecole: EcoleItem): Promise<void> {
    await changerOrganisationActiveFrontend(ecole.idOrganisation);
    await changerEcoleActiveFrontend(ecole.id);
    activeContextStore.setGovernanceLevel('ECOLE');
    await router.push({
      name: 'school-administration-detail',
      params: { idEcole: ecole.id },
      query: { retour: `/app/organisation/organisations/${ecole.idOrganisation}/ecoles` },
    });
  }

  async function creerEcole(): Promise<void> {
    if (!organisationId.value || !canCreateSchool.value) return;
    await router.push({
      name: 'school-administration-registry',
      query: {
        idOrganisation: organisationId.value,
        creation: '1',
        retour: `/app/organisation/organisations/${organisationId.value}/ecoles`,
      },
    });
  }

  function ouvrirDialogueStatut(ecole: EcoleItem): void {
    selectedSchool.value = ecole;
    store.reinitialiserMessages();
    statusDialogOpen.value = true;
  }

  function fermerDialogueStatut(): void {
    statusDialogOpen.value = false;
    selectedSchool.value = null;
    store.reinitialiserMessages();
  }

  async function confirmerChangementStatut(): Promise<void> {
    if (!selectedSchool.value) return;

    if (selectedSchool.value.actif) {
      await store.desactiverEcole(selectedSchool.value.id);
    } else {
      await store.activerEcole(selectedSchool.value.id);
    }

    if (store.state.status === 'ready') {
      statusDialogOpen.value = false;
      selectedSchool.value = null;
      notificationsService.succes(
        'Statut mis a jour',
        'La mise a jour du statut de l ecole a ete appliquee avec succes.',
      );
      await chargerOrganisationEtPremierePage();
    }
  }

  async function actualiser(): Promise<void> {
    await chargerOrganisationEtPremierePage();
    notificationsService.info('Liste actualisee', 'Les ecoles rattachees ont ete rechargees.');
  }

  function revenirEnHaut(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onMounted(async () => {
    await chargerOrganisationEtPremierePage();
    brancherInfiniteScroll();
    window.addEventListener('scroll', gererScrollFenetre, { passive: true });
  });

  onUnmounted(() => {
    observer.value?.disconnect();
    window.removeEventListener('scroll', gererScrollFenetre);
  });

  return {
    organisation,
    filteredSchools,
    searchTerm,
    statusFilter,
    availableStatuses,
    stats,
    isLoading,
    isBusy,
    errorMessage,
    canCreateSchool,
    canViewSchool,
    canConfigureSchool,
    canToggleSchoolStatus,
    canOpenSchoolWorkspace,
    sentinelElement,
    toutCharge,
    chargementSupplementaire,
    showBackToTop,
    statusDialogOpen,
    selectedSchool,
    formaterDate,
    lireSectionsOrganisees,
    lireModulesActives,
    actualiser,
    revenirOrganisation,
    revenirRegistre,
    voirEcole,
    configurerEcole,
    ouvrirEcole,
    creerEcole,
    ouvrirDialogueStatut,
    fermerDialogueStatut,
    confirmerChangementStatut,
    revenirEnHaut,
  };
}
