import { Building2, CircleOff, School, Wifi } from 'lucide-vue-next';
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSchoolAdministrationStore } from '../stores/school-administration.store';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';

export function useSchoolAdministrationHomeViewModel() {
  const router = useRouter();
  const store = useSchoolAdministrationStore();
  const context = activeContextStore.state;
  const doctrine = useDoctrineAccess();

  const currentOrganization = computed(
    () => store.state.organisations.find((organization) => organization.id === context.organizationId) ?? null,
  );

  const canReadRegistry = computed(() =>
    doctrine.canUseAction('referentiel.read', 'ADM-001'),
  );

  const summaryCards = computed(() => {
    const schools = store.state.ecoles;
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
        value: schools.length,
        hint: currentOrganization.value
          ? "Dans l'organisation actuellement ouverte."
          : "Disponible apres la selection d'une organisation.",
        icon: School,
        tone: 'primary' as const,
        action: () => router.push('/app/administration-ecole/ecoles'),
      },
      {
        label: 'Ecoles actives',
        value: activeCount,
        hint: currentOrganization.value
          ? 'Etablissements immediatement exploitables.'
          : 'Aucune lecture organisationnelle en cours.',
        icon: Wifi,
        tone: 'success' as const,
        action: () => router.push('/app/administration-ecole/ecoles?statut=ACTIVE'),
      },
      {
        label: 'Ecoles inactives',
        value: inactiveCount,
        hint: currentOrganization.value
          ? 'Etablissements visibles mais suspendus.'
          : 'Aucune lecture organisationnelle en cours.',
        icon: CircleOff,
        tone: 'warning' as const,
        action: () => router.push('/app/administration-ecole/ecoles?statut=INACTIVE'),
      },
      {
        label: 'Mode synchronise',
        value: syncCount,
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
    await store.loadOrganizations();
    if (context.organizationId) {
      await store.loadSchoolsByOrganization(context.organizationId);
    }
  }

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
