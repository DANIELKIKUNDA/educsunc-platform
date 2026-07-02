import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { activeContextStore } from '../session/active-context.store';
import { sessionStore } from '../auth/session.store';
import { pageDoctrine } from './frontend-doctrine';
import { resolvePageByRouteName, resolvePageByRoutePath } from './doctrine.resolver';

export function useDoctrineAccess() {
  const route = useRoute();

  const currentPage = computed(
    () => resolvePageByRouteName(route.name) ?? resolvePageByRoutePath(route.path),
  );

  const actorCode = computed(() => sessionStore.state.actorCode);
  const governanceLevel = computed(() => activeContextStore.state.governanceLevel);

  const isCurrentPageAllowed = computed(() => {
    if (!currentPage.value) {
      return true;
    }

    return (
      currentPage.value.actorCodes.includes(actorCode.value) &&
      currentPage.value.governanceLevels.includes(governanceLevel.value)
    );
  });

  function canAccessPage(pageCode: string): boolean {
    const page = pageDoctrine.find((entry) => entry.code === pageCode);
    if (!page) {
      return false;
    }

    return page.actorCodes.includes(actorCode.value) && page.governanceLevels.includes(governanceLevel.value);
  }

  function canUseAction(actionCode: string, pageCode?: string): boolean {
    const page =
      (pageCode ? pageDoctrine.find((entry) => entry.code === pageCode) : currentPage.value) ?? undefined;

    if (!page) {
      return false;
    }

    const action = page.visibleActions.find((entry) => entry.code === actionCode);
    if (!action) {
      return false;
    }

    const actorAllowed = action.actorCodes === undefined || action.actorCodes.includes(actorCode.value);
    return actorAllowed && page.actorCodes.includes(actorCode.value) && page.governanceLevels.includes(governanceLevel.value);
  }

  function listVisibleActions(pageCode?: string) {
    const page =
      (pageCode ? pageDoctrine.find((entry) => entry.code === pageCode) : currentPage.value) ?? undefined;

    if (!page || !canAccessPage(page.code)) {
      return [];
    }

    return page.visibleActions.filter((action) =>
      action.actorCodes === undefined || action.actorCodes.includes(actorCode.value),
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
