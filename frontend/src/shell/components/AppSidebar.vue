<template>
  <aside class="erp-sidebar" :class="{ 'erp-sidebar--compact': compact }">
    <div class="erp-sidebar__brand">
      <div class="erp-sidebar__logo">E</div>
      <div v-if="!compact" class="erp-sidebar__brand-copy">
        <span>EduSync</span>
        <strong>{{ actorLabel }}</strong>
      </div>
    </div>

    <div v-if="!compact" class="erp-sidebar__context">
      <span>{{ levelLabel }}</span>
      <strong>{{ contextTitle }}</strong>
      <small>{{ contextSubtitle }}</small>
    </div>

    <nav class="erp-sidebar__modules">
      <section
        v-for="entry in entries"
        :key="entry.code"
        class="erp-sidebar__module"
        :class="{ 'erp-sidebar__module--open': openCode === entry.code }"
      >
        <button
          type="button"
          class="erp-sidebar__module-trigger"
          :class="{ 'erp-sidebar__module-trigger--active': isModuleActive(entry.route) }"
          @pointerenter="preload(entry.route)"
          @focus="preload(entry.route)"
          @click="handleModuleTrigger(entry)"
        >
          <span class="erp-sidebar__module-leading">
            <component :is="resolveIcon(entry.icon)" class="erp-sidebar__icon" />
            <span v-if="!compact" class="erp-sidebar__module-copy">
              <strong>{{ entry.label }}</strong>
              <small>{{ entry.description }}</small>
            </span>
          </span>
          <ChevronDown v-if="!compact && entry.children.length > 0" class="erp-sidebar__chevron" />
        </button>

        <div v-if="!compact && entry.children.length > 0 && openCode === entry.code" class="erp-sidebar__children">
          <RouterLink
            v-for="child in entry.children"
            :key="child.code"
            :to="child.route"
            class="erp-sidebar__child"
            :class="{ 'erp-sidebar__child--active': isRouteActive(child.route) }"
            @pointerenter="preload(child.route)"
            @focus="preload(child.route)"
          >
            <component :is="resolveIcon(child.icon)" class="erp-sidebar__child-icon" />
            <span>{{ child.label }}</span>
          </RouterLink>
        </div>
      </section>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronDown, LayoutGrid } from 'lucide-vue-next';
import { activeContextStore } from '../../shared/session/active-context.store';
import type { NavigationEntry } from '../../shared/navigation/navigation.types';
import { shellIconMap } from '../icon-map';
import { preloadRouteOnIntent } from '../../router/route-preloader';

const props = defineProps<{
  actorLabel: string;
  compact?: boolean;
  entries: NavigationEntry[];
}>();

const route = useRoute();
const router = useRouter();
const context = activeContextStore.state;
const openCode = ref(props.entries.find((entry) => route.path.startsWith(entry.route))?.code ?? props.entries[0]?.code ?? '');

watch(
  () => [route.path, props.entries],
  () => {
    const activeEntry = props.entries.find((entry) => route.path.startsWith(entry.route));
    if (activeEntry) {
      openCode.value = activeEntry.code;
    }
  },
  { immediate: true },
);

const levelLabel = computed(() => {
  if (context.governanceLevel === 'PLATEFORME') return 'Plateforme active';
  if (context.governanceLevel === 'ORGANISATION') return 'Organisation active';
  return 'Ecole active';
});

const contextTitle = computed(() => {
  if (context.governanceLevel === 'PLATEFORME') return 'Pilotage global EduSync';
  if (context.governanceLevel === 'ORGANISATION') return context.organizationName;
  return context.schoolName;
});

const contextSubtitle = computed(() => {
  if (context.governanceLevel === 'PLATEFORME') return 'Modules transversaux, supervision et securite';
  if (context.governanceLevel === 'ORGANISATION') return 'Supervision multi-ecoles et gouvernance';
  return `${context.sectionName} · ${context.schoolYearLabel}`;
});

function toggleModule(code: string): void {
  openCode.value = openCode.value === code ? '' : code;
}

function handleModuleTrigger(entry: NavigationEntry): void {
  if (props.compact || entry.children.length === 0) {
    void router.push(entry.route);
    return;
  }

  toggleModule(entry.code);
}

function isModuleActive(routePrefix: string): boolean {
  return route.path.startsWith(routePrefix);
}

function isRouteActive(targetRoute: string): boolean {
  return route.path === targetRoute || route.path.startsWith(`${targetRoute}/`);
}

function preload(targetRoute: string): void {
  preloadRouteOnIntent(router, targetRoute);
}

function resolveIcon(iconName: string) {
  return shellIconMap[iconName as keyof typeof shellIconMap] ?? LayoutGrid;
}
</script>
