import { computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { sessionStore } from '../../../shared/auth/session.store';
import { getAccessiblePages } from '../../../shared/doctrine/doctrine.resolver';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { activeContextStore } from '../../../shared/session/active-context.store';

const DESTINATION_PRIORITIES = {
  ORGANISATION: [
    '/app/notifications/organisation',
    '/app/notifications/organisation/realtime',
    '/app/notifications/organisation/escalades',
  ],
  ECOLE: [
    '/app/notifications/ecole',
    '/app/notifications/ecole/envoyer',
    '/app/notifications/ecole/operations',
    '/app/notifications/ecole/dead-letter',
  ],
  PLATEFORME: [],
} as const;

export function useNotificationsEntryViewModel() {
  const router = useRouter();
  const doctrine = useDoctrineAccess();
  const governanceLevel = computed(() => activeContextStore.state.governanceLevel);

  const accessiblePages = computed(() =>
    getAccessiblePages(sessionStore.state.actorCode, governanceLevel.value)
      .filter((page) => page.moduleCode === 'NOTIFICATIONS')
      .filter((page) => page.routePath !== '/app/notifications')
      .filter((page) => !page.routePath.includes('/:'))
      .filter((page) => doctrine.canAccessPage(page.code)),
  );

  const destination = computed(() => {
    const priorities = DESTINATION_PRIORITIES[governanceLevel.value];
    return priorities.find((routePath) =>
      accessiblePages.value.some((page) => page.routePath === routePath),
    ) ?? null;
  });

  watch(destination, (routePath) => {
    if (routePath) {
      void router.replace(routePath);
    }
  }, { immediate: true });

  return {
    governanceLevel,
    destination,
  };
}
