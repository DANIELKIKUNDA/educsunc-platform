import { computed, onMounted } from 'vue';
import { useSchoolAdministrationStore } from '../stores/school-administration.store';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { sessionStore } from '../../../shared/auth/session.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';

export function useSchoolAdministrationHomeViewModel() {
  const store = useSchoolAdministrationStore();
  const session = sessionStore.state;
  const context = activeContextStore.state;
  const doctrine = useDoctrineAccess();

  const currentOrganization = computed(
    () => store.state.organisations.find((organization) => organization.id === context.organizationId) ?? null,
  );

  const canReadRegistry = computed(() =>
    doctrine.canUseAction('referentiel.read', 'ADM-001'),
  );

  const summaryCards = computed(() => [
    {
      label: 'Perimetre',
      value: 'Plateforme',
      hint: 'ADM-01 gouverne l existence de l ecole, pas son exploitation quotidienne.',
    },
    {
      label: 'Lecture backend',
      value: 'referentiel.read',
      hint: 'Lecture du registre et de la fiche detaillee des ecoles.',
    },
    {
      label: 'Mutation backend',
      value: 'referentiel.write',
      hint: 'Creation, renommage, identite institutionnelle et cycle de vie.',
    },
    {
      label: 'Acteur courant',
      value: session.actorLabel,
      hint: 'Le backend reste seul juge des droits reels sur les mutations structurelles.',
    },
  ]);

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
    session,
    context,
    canReadRegistry,
    currentOrganization,
    summaryCards,
    load,
  };
}
