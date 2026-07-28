import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { pageDoctrine } from './frontend-doctrine';
import {
  isActionAccessible,
  isPageAccessible,
  isPageAccessibleForPath,
  listAccessibleActions,
  resolvePageByRouteName,
  resolvePageByRoutePath,
} from './doctrine.resolver';

export function useDoctrineAccess() {
  const route = useRoute();

  const currentPage = computed(
    () => resolvePageByRouteName(route.name) ?? resolvePageByRoutePath(route.path),
  );

  const isCurrentPageAllowed = computed(() => {
    if (!currentPage.value) {
      return false;
    }
    return isPageAccessibleForPath(currentPage.value, route.path);
  });

  function canAccessPage(pageCode: string): boolean {
    const page = pageDoctrine.find((entry) => entry.code === pageCode);
    if (!page) {
      return false;
    }

    return page.code === currentPage.value?.code
      ? isPageAccessibleForPath(page, route.path)
      : isPageAccessible(page);
  }

  function canUseAction(actionCode: string, pageCode?: string): boolean {
    const page =
      (pageCode ? pageDoctrine.find((entry) => entry.code === pageCode) : currentPage.value) ?? undefined;

    if (!page) {
      return false;
    }

    return isActionAccessible(
      page.code,
      actionCode,
      undefined,
      undefined,
      page.code === currentPage.value?.code ? route.path : undefined,
    );
  }

  function listVisibleActions(pageCode?: string) {
    const page =
      (pageCode ? pageDoctrine.find((entry) => entry.code === pageCode) : currentPage.value) ?? undefined;

    if (!page || !canAccessPage(page.code)) {
      return [];
    }

    return listAccessibleActions(
      page,
      undefined,
      undefined,
      page.code === currentPage.value?.code ? route.path : undefined,
    );
  }

  return {
    currentPage,
    isCurrentPageAllowed,
    canAccessPage,
    canUseAction,
    listVisibleActions,
  };
}
