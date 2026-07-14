import { Building2, CircleOff, School, Wifi } from 'lucide-vue-next';
import { computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useSchoolAdministrationStore } from '../stores/school-administration.store';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';

export function useSchoolAdministrationHomeViewModel() {
  const router = useRouter();
  const store = useSchoolAdministrationStore();
  const context = activeContextStore.state;
  const doctrine = useDoctrineAccess();
  let initialisationTerminee = false;

  const currentOrganization = computed(
    () => store.state.organisations.find((organization) => organization.id === context.organizationId) ?? null,
  );

  const canReadRegistry = computed(() =>
    doctrine.canUseAction('referentiel.read', 'ADM-001'),
  );

  const summaryCards = computed(() => {
    const schools = store.state.ecoles;
    const organisationChargee = currentOrganization.value !== null
      && store.state.selectedOrganisationId === currentOrganization.value.id;
    const activeCount = schools.filter((school) => school.actif).length;
    const inactiveCount = schools.length - activeCount;
    const syncCount = schools.filter((school) => school.modeExploitation === 'SYNC').length;

    return [
      {
        label: 'Organisation selectionnee',
        value: currentOrganization.value?.code ?? 'A choisir',
        hint: currentOrganization.value?.nom ?? "Selectionnez une organisation pour afficher ses ecoles.",
        icon: Building2,
        tone: 'neutral' as const,
        action: () => router.push('/app/administration-ecole/ecoles'),
      },
      {
        label: 'Ecoles enregistrees',
        value: organisationChargee ? schools.length : 'En attente',
        hint: currentOrganization.value
          ? "Dans l'organisation actuellement ouverte."
          : "Disponible apres la selection d'une organisation.",
        icon: School,
        tone: 'primary' as const,
        action: () => router.push('/app/administration-ecole/ecoles'),
      },
      {
        label: 'Ecoles actives',
        value: organisationChargee ? activeCount : 'En attente',
        hint: currentOrganization.value
          ? 'Etablissements immediatement exploitables.'
          : 'Aucune lecture organisationnelle en cours.',
        icon: Wifi,
        tone: 'success' as const,
        action: () => router.push('/app/administration-ecole/ecoles?statut=ACTIVE'),
      },
      {
        label: 'Ecoles inactives',
        value: organisationChargee ? inactiveCount : 'En attente',
        hint: currentOrganization.value
          ? 'Etablissements visibles mais suspendus.'
          : 'Aucune lecture organisationnelle en cours.',
        icon: CircleOff,
        tone: 'warning' as const,
        action: () => router.push('/app/administration-ecole/ecoles?statut=INACTIVE'),
      },
      {
        label: 'Mode synchronise',
        value: organisationChargee ? syncCount : 'En attente',
        hint: currentOrganization.value
          ? 'Ecoles actuellement en fonctionnement synchronise.'
          : "Le mode s'affichera apres la lecture d'une organisation.",
        icon: Wifi,
        tone: 'neutral' as const,
        action: () => router.push('/app/administration-ecole/ecoles?mode=SYNC'),
      },
    ];
  });

  const highlightedSchools = computed(() => store.state.ecoles.slice(0, 3));

  async function load(): Promise<void> {
    initialisationTerminee = false;
    await store.loadOrganizations();
    if (
      context.organizationId
      && store.state.organisations.some((organisation) => organisation.id === context.organizationId)
    ) {
      await store.loadSchoolsByOrganization(context.organizationId);
    }
    initialisationTerminee = true;
  }

  watch(
    () => context.organizationId,
    (organizationId, previousOrganizationId) => {
      if (
        !initialisationTerminee
        || !organizationId
        || organizationId === previousOrganizationId
        || !store.state.organisations.some((organisation) => organisation.id === organizationId)
      ) {
        return;
      }

      void store.loadSchoolsByOrganization(organizationId);
    },
  );

  onMounted(() => {
    void load();
  });

  return {
    store,
    canReadRegistry,
    currentOrganization,
    summaryCards,
    highlightedSchools,
    load,
  };
}
