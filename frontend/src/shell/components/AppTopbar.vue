<template>
  <header class="erp-topbar" :class="{ 'erp-topbar--mobile': mobile }">
    <button
      type="button"
      class="erp-topbar__nav-toggle"
      :aria-label="mobile ? 'Ouvrir le menu' : sidebarCompact ? 'Etendre le menu' : 'Compacter le menu'"
      @click="$emit('toggle-navigation')"
    >
      <PanelLeftOpen v-if="mobile || sidebarCompact" />
      <PanelLeftClose v-else />
    </button>

    <div v-if="!mobile" class="erp-topbar__breadcrumb">
      <span v-for="item in breadcrumb" :key="item" class="erp-topbar__breadcrumb-item">
        {{ item }}
      </span>
    </div>
    <div v-else class="erp-topbar__mobile-copy">
      <span>{{ mobileContextLabel }}</span>
      <strong>{{ currentPageTitle }}</strong>
    </div>

    <div v-if="!mobile" class="erp-topbar__search">
      <Search class="erp-topbar__search-icon" />
      <input v-model="query" type="search" placeholder="Rechercher un ecran, un module ou une action..." />
      <div v-if="query.trim() && searchResults.length > 0" class="erp-topbar__search-results">
        <RouterLink
          v-for="result in searchResults"
          :key="`${result.code}-${result.actionLabel ?? 'page'}`"
          :to="result.route"
          class="erp-topbar__search-result"
          @click="query = ''"
        >
          <span>{{ result.moduleLabel }}</span>
          <strong>{{ result.label }}</strong>
          <small v-if="result.actionLabel">{{ result.actionLabel }}</small>
        </RouterLink>
      </div>
    </div>

    <ContextSwitcher v-if="!mobile" class="erp-topbar__context" />

    <div v-if="!mobile" class="erp-topbar__signals">
      <span class="erp-shell-badge erp-shell-badge--level">
        {{ activeLevelLabel }}
      </span>
      <span v-if="context.governanceLevel !== 'PLATEFORME'" class="erp-shell-badge erp-shell-badge--scope">
        {{ context.organizationName }}
      </span>
      <span v-if="context.governanceLevel === 'ECOLE'" class="erp-shell-badge erp-shell-badge--scope">
        {{ context.schoolName }}
      </span>
      <span v-if="context.governanceLevel === 'ECOLE'" class="erp-shell-badge erp-shell-badge--scope">
        {{ context.schoolYearLabel }}
      </span>
      <span v-if="session.authMode === 'dev'" class="erp-shell-badge erp-shell-badge--dev-topbar">
        Mode dev
      </span>
      <button type="button" class="erp-topbar__signal">
        <Bell />
        <span>0</span>
      </button>
      <button type="button" class="erp-topbar__signal">
        <MessagesSquare />
        <span>0</span>
      </button>
    </div>

    <UserMenu />
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Bell, MessagesSquare, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-vue-next';
import { resolvePageByRouteName } from '../../shared/doctrine/doctrine.resolver';
import { flattenNavigation } from '../../shared/navigation/navigation.builder';
import { sessionStore } from '../../shared/auth/session.store';
import { activeContextStore } from '../../shared/session/active-context.store';
import type { NavigationEntry } from '../../shared/navigation/navigation.types';
import ContextSwitcher from './ContextSwitcher.vue';
import UserMenu from './UserMenu.vue';

const props = defineProps<{
  entries: NavigationEntry[];
  mobile?: boolean;
  sidebarCompact?: boolean;
}>();

defineEmits<{
  (event: 'toggle-navigation'): void;
}>();

type TopbarSearchResult = {
  code: string;
  route: string;
  moduleLabel: string;
  label: string;
  actionLabel?: string;
  searchText: string;
};

const route = useRoute();
const context = activeContextStore.state;
const session = sessionStore.state;
const query = ref('');

const currentModule = computed(() => props.entries.find((entry) => route.path.startsWith(entry.route)) ?? props.entries[0]);
const currentPage = computed(() => resolvePageByRouteName(route.name));
const currentPageTitle = computed(() => currentPage.value?.label ?? String(route.meta.title ?? currentModule.value?.label ?? 'EduSync'));
const mobileContextLabel = computed(() => {
  if (context.governanceLevel === 'PLATEFORME') return 'Plateforme';
  if (context.governanceLevel === 'ORGANISATION') return context.organizationName;
  return `${context.schoolName} - ${context.schoolYearLabel}`;
});
const activeLevelLabel = computed(() => {
  if (context.governanceLevel === 'PLATEFORME') return 'Plateforme';
  if (context.governanceLevel === 'ORGANISATION') return 'Organisation';
  return `Ecole ${context.sectionName}`;
});

const breadcrumb = computed(() => {
  const items: string[] = [];
  if (context.governanceLevel === 'PLATEFORME') {
    items.push('Plateforme');
  } else {
    items.push(context.organizationName);
    if (context.governanceLevel === 'ECOLE') {
      items.push(context.schoolName);
    }
  }

  if (currentModule.value) {
    items.push(currentModule.value.label);
  }

  if (currentPageTitle.value !== currentModule.value?.label) {
    items.push(currentPageTitle.value);
  }

  return items;
});

const searchResults = computed(() => {
  const search = query.value.trim().toLowerCase();
  if (!search) {
    return [];
  }

  return flattenNavigation(props.entries)
    .flatMap<TopbarSearchResult>((entry) => {
      const pageResult: TopbarSearchResult = {
        code: entry.code,
        route: entry.route,
        moduleLabel: entry.moduleLabel,
        label: entry.label,
        searchText: `${entry.moduleLabel} ${entry.label} ${entry.sectionLabel}`.toLowerCase(),
      };

      const actionResults: TopbarSearchResult[] = entry.visibleActions.map((action) => ({
        code: entry.code,
        route: entry.route,
        moduleLabel: entry.moduleLabel,
        label: entry.label,
        actionLabel: action.label,
        searchText: `${entry.moduleLabel} ${entry.label} ${entry.sectionLabel} ${action.label}`.toLowerCase(),
      }));

      return [pageResult, ...actionResults];
    })
    .filter((entry) => entry.searchText.includes(search))
    .slice(0, 8);
});
</script>
