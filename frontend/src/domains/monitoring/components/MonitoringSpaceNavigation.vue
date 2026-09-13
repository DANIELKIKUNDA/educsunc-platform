<template>
  <SectionBlock
    title="Espaces de supervision"
    description="Accedez directement aux vues disponibles selon vos autorisations."
  >
    <nav class="mon-space-grid" aria-label="Espaces de supervision">
      <RouterLink
        v-for="page in pages"
        :key="page.code"
        class="mon-space-card"
        :to="page.routePath"
      >
        <span class="mon-space-card__icon" aria-hidden="true">
          <component :is="resolveIcon(page.icon)" />
        </span>
        <span class="mon-space-card__copy">
          <strong>{{ page.label }}</strong>
          <small>{{ page.sectionLabel }}</small>
        </span>
        <ArrowUpRight class="mon-space-card__arrow" aria-hidden="true" />
      </RouterLink>
    </nav>
  </SectionBlock>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { Activity, ArrowUpRight } from 'lucide-vue-next';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import { sessionStore } from '../../../shared/auth/session.store';
import { getAccessiblePages } from '../../../shared/doctrine/doctrine.resolver';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { shellIconMap } from '../../../shell/icon-map';

const pages = computed(() =>
  getAccessiblePages(
    sessionStore.state.actorCode,
    activeContextStore.state.governanceLevel,
  ).filter((page) =>
    page.moduleCode === 'MONITORING'
    && page.routePath !== '/app/monitoring'
    && !page.routePath.includes('/:')
  ),
);

function resolveIcon(iconName: string) {
  return shellIconMap[iconName as keyof typeof shellIconMap] ?? Activity;
}
</script>

<style scoped>
.mon-space-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 0.8rem;
}

.mon-space-card {
  min-height: 82px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.8rem;
  padding: 0.9rem;
  border: 1px solid rgba(15, 42, 67, 0.09);
  border-radius: 18px;
  background: linear-gradient(145deg, #ffffff, #f7fbfd);
  color: #173149;
  text-decoration: none;
  transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.mon-space-card:hover {
  transform: translateY(-2px);
  border-color: rgba(12, 120, 149, 0.28);
  box-shadow: 0 14px 30px rgba(15, 42, 67, 0.08);
}

.mon-space-card:focus-visible {
  outline: 3px solid rgba(20, 135, 168, 0.25);
  outline-offset: 2px;
}

.mon-space-card__icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  background: #e9f7fa;
  color: #08728f;
}

.mon-space-card__icon :deep(svg),
.mon-space-card__arrow {
  width: 19px;
  height: 19px;
}

.mon-space-card__copy {
  min-width: 0;
  display: grid;
  gap: 0.2rem;
}

.mon-space-card__copy strong,
.mon-space-card__copy small {
  overflow: hidden;
  text-overflow: ellipsis;
}

.mon-space-card__copy small {
  color: #718194;
  white-space: nowrap;
}

.mon-space-card__arrow {
  color: #08728f;
}

@media (max-width: 680px) {
  .mon-space-grid {
    grid-template-columns: 1fr;
  }
}
</style>
