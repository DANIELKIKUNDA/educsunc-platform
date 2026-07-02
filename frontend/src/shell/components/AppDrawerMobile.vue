<template>
  <div v-if="modelValue" class="erp-drawer">
    <button type="button" class="erp-drawer__backdrop" @click="$emit('update:modelValue', false)" />
    <aside class="erp-drawer__panel">
      <div class="erp-drawer__header">
        <div>
          <span>EduSync</span>
          <strong>{{ actorLabel }}</strong>
        </div>
        <button type="button" class="erp-drawer__close" @click="$emit('update:modelValue', false)">Fermer</button>
      </div>

      <nav class="erp-drawer__modules">
        <section v-for="entry in entries" :key="entry.code" class="erp-drawer__module">
          <button type="button" class="erp-drawer__module-trigger" @click="toggleModule(entry.code)">
            <span class="erp-drawer__module-leading">
              <component :is="resolveIcon(entry.icon)" class="erp-drawer__icon" />
              <strong>{{ entry.label }}</strong>
            </span>
            <ChevronDown class="erp-drawer__chevron" />
          </button>

          <div v-if="openCode === entry.code" class="erp-drawer__children">
            <RouterLink
              v-for="child in entry.children"
              :key="child.code"
              :to="child.route"
              class="erp-drawer__child"
              :class="{ 'erp-drawer__child--active': isRouteActive(child.route) }"
              @click="$emit('update:modelValue', false)"
            >
              <component :is="resolveIcon(child.icon)" class="erp-drawer__child-icon" />
              <span>{{ child.label }}</span>
            </RouterLink>
          </div>
        </section>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ChevronDown, LayoutGrid } from 'lucide-vue-next';
import type { NavigationEntry } from '../../shared/navigation/navigation.types';
import { shellIconMap } from '../icon-map';

const props = defineProps<{
  modelValue: boolean;
  actorLabel: string;
  entries: NavigationEntry[];
}>();

defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
}>();

const route = useRoute();
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

function toggleModule(code: string): void {
  openCode.value = openCode.value === code ? '' : code;
}

function isRouteActive(targetRoute: string): boolean {
  return route.path === targetRoute || route.path.startsWith(`${targetRoute}/`);
}

function resolveIcon(iconName: string) {
  return shellIconMap[iconName as keyof typeof shellIconMap] ?? LayoutGrid;
}
</script>
