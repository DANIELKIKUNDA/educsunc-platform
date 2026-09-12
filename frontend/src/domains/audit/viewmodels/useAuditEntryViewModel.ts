import { computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { sessionStore } from '../../../shared/auth/session.store';
import { getAccessiblePages } from '../../../shared/doctrine/doctrine.resolver';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';

export function useAuditEntryViewModel() {
  const router = useRouter();
  const doctrine = useDoctrineAccess();

  const destination = computed(() => {
    const pages = getAccessiblePages(
      sessionStore.state.actorCode,
      activeContextStore.state.governanceLevel,
    );

    return pages.find((page) =>
      page.moduleCode === 'AUDIT'
      && page.routePath !== '/app/audit'
      && !page.routePath.includes('/:')
      && doctrine.canAccessPage(page.code),
    )?.routePath ?? null;
  });

  watch(destination, (routePath) => {
    if (routePath) {
      void router.replace(routePath);
    }
  }, { immediate: true });

  return {
    destination,
  };
}
