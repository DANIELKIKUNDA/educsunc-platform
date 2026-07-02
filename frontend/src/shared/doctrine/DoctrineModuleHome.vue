<template>
  <PageContainer>
    <PageHeader :eyebrow="eyebrow" :title="title" :description="description">
      <template #actions>
        <div v-if="quickLinks.length > 0" class="module-home-actions">
          <RouterLink
            v-for="link in quickLinks"
            :key="link.code"
            class="module-home-pill"
            :to="link.route"
          >
            {{ link.label }}
          </RouterLink>
        </div>
      </template>
    </PageHeader>

    <SectionBlock title="Etat du module" description="Le centre de module relit directement la doctrine active pour cet acteur et ce contexte.">
      <div class="module-home-stats">
        <StatChip label="Acteur" :value="session.actorLabel" />
        <StatChip label="Niveau" :value="context.governanceLevel" />
        <StatChip label="Pages visibles" :value="String(cards.length)" />
        <StatChip label="Actions visibles" :value="String(totalActions)" />
      </div>
    </SectionBlock>

    <SectionBlock
      title="Acces autorises"
      description="Les cartes ci-dessous sont composees depuis la doctrine visible du profil courant."
    >
      <div v-if="cards.length > 0" class="module-home-grid">
        <RouterLink
          v-for="card in cards"
          :key="card.code"
          class="module-home-card"
          :to="card.route"
        >
          <span class="module-home-card__badge">{{ card.code }}</span>
          <strong>{{ card.label }}</strong>
          <small>{{ card.sectionLabel }}</small>
          <p>{{ card.summary }}</p>
          <div v-if="card.actionLabels.length > 0" class="module-home-card__actions">
            <span v-for="actionLabel in card.actionLabels.slice(0, 3)" :key="actionLabel">
              {{ actionLabel }}
            </span>
          </div>
        </RouterLink>
      </div>
      <EmptyState
        v-else
        title="Aucun ecran supplementaire visible"
        message="Ce module reste accessible mais ne propose pas d autre point d entree visible dans le contexte courant."
      />
    </SectionBlock>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import PageContainer from '../layout/PageContainer.vue';
import PageHeader from '../layout/PageHeader.vue';
import SectionBlock from '../layout/SectionBlock.vue';
import EmptyState from '../ui/EmptyState.vue';
import StatChip from '../ui/StatChip.vue';
import { activeContextStore } from '../session/active-context.store';
import { sessionStore } from '../auth/session.store';
import { buildVisibleNavigation } from '../navigation/navigation.builder';
import { getAccessiblePages } from './doctrine.resolver';
import type { FrontendModuleCode, FrontendPageDoctrine } from './doctrine.types';

const props = defineProps<{
  moduleCode: FrontendModuleCode;
  eyebrow: string;
  title: string;
  description: string;
}>();

type ModuleHomeCard = {
  code: string;
  label: string;
  route: string;
  sectionLabel: string;
  summary: string;
  actionLabels: string[];
};

const context = activeContextStore.state;
const session = sessionStore.state;

const visibleNavigation = computed(() => buildVisibleNavigation());

const navigationEntry = computed(() =>
  visibleNavigation.value.find((entry) => entry.code === props.moduleCode),
);

const accessibleModulePages = computed(() => {
  const actorCode = sessionStore.state.actorCode;
  const governanceLevel = activeContextStore.state.governanceLevel;
  return getAccessiblePages(actorCode as never, governanceLevel)
    .filter((page) => page.moduleCode === props.moduleCode && page.routePath !== navigationEntry.value?.route)
    .filter((page) => !page.routePath.includes('/:'));
});

function summarizePage(page: FrontendPageDoctrine): string {
  if (page.visibleActions.length > 0) {
    return page.visibleActions.map((action) => action.label).join(' | ');
  }

  return `Section ${page.sectionLabel}`;
}

const cards = computed<ModuleHomeCard[]>(() => {
  if (navigationEntry.value && navigationEntry.value.children.length > 0) {
    return navigationEntry.value.children.map((child) => ({
      code: child.code,
      label: child.label,
      route: child.route,
      sectionLabel: child.sectionLabel,
      summary:
        child.visibleActions.length > 0
          ? child.visibleActions.map((action) => action.label).join(' | ')
          : `Section ${child.sectionLabel}`,
      actionLabels: child.visibleActions.map((action) => action.label),
    }));
  }

  return accessibleModulePages.value.map((page) => ({
    code: page.code,
    label: page.label,
    route: page.routePath,
    sectionLabel: page.sectionLabel,
    summary: summarizePage(page),
    actionLabels: page.visibleActions.map((action) => action.label),
  }));
});

const quickLinks = computed(() => cards.value.slice(0, 6));
const totalActions = computed(() => cards.value.reduce((sum, card) => sum + card.actionLabels.length, 0));
</script>

<style scoped>
.module-home-actions{display:flex;flex-wrap:wrap;gap:.75rem}
.module-home-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;font-weight:600;text-decoration:none}
.module-home-stats,.module-home-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.module-home-card{display:grid;gap:.6rem;padding:1rem 1.05rem;border-radius:24px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);text-decoration:none;color:#11283f}
.module-home-card__badge{display:inline-flex;width:max-content;border-radius:999px;padding:.2rem .6rem;background:#edf4f8;color:#365066;font-size:.82rem;font-weight:700}
.module-home-card small{color:#486173}
.module-home-card p{margin:0;color:#5d7385;line-height:1.55}
.module-home-card__actions{display:flex;flex-wrap:wrap;gap:.6rem}
.module-home-card__actions span{display:inline-flex;border-radius:999px;padding:.24rem .65rem;background:#f5f8fb;color:#365066;font-size:.8rem;font-weight:600}
</style>
