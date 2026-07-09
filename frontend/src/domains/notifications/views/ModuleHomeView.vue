<template>
  <PageContainer>
    <PageHeader
      eyebrow="NOTIF-HOME"
      title="Centre notifications"
      description="Point d'entree de diffusion, lecture locale, supervision organisationnelle et operations techniques selon l'acteur et le perimetre actif."
    >
      <template #actions>
        <div class="notif-home-actions">
          <RouterLink
            v-for="link in quickLinks"
            :key="link.code"
            class="notif-home-pill"
            :class="{ 'notif-home-pill--primary': link.primary }"
            :to="link.route"
          >
            {{ link.label }}
          </RouterLink>
        </div>
      </template>
    </PageHeader>

    <SectionBlock
      title="Contexte notification actif"
      description="Le shell rappelle ici le vrai niveau de diffusion ou de supervision avant d'ouvrir une vue notifications."
    >
      <div class="notif-home-grid">
        <StatChip label="Acteur" :value="session.actorLabel" />
        <StatChip label="Niveau" :value="context.governanceLevel" />
        <StatChip label="Organisation" :value="context.organizationName" />
        <StatChip label="Ecole" :value="context.schoolName" />
        <StatChip label="Annee" :value="context.schoolYearLabel" />
        <StatChip label="Pages visibles" :value="String(notificationPages.length)" />
      </div>
    </SectionBlock>

    <SectionBlock
      title="Centre et diffusion locale"
      description="Actions locales de consultation, composition et lecture des notifications d'ecole."
    >
      <EmptyState
        v-if="schoolPages.length === 0"
        title="Aucune vue locale visible"
        message="Ce profil n'ouvre actuellement aucune vue locale de diffusion ou de lecture notifications."
      />
      <div v-else class="notif-home-card-grid">
        <RouterLink
          v-for="page in schoolPages"
          :key="page.code"
          class="notif-home-card"
          :to="page.routePath"
        >
          <span class="notif-home-badge">{{ page.code }}</span>
          <strong>{{ page.label }}</strong>
          <small>{{ page.sectionLabel }}</small>
          <p>{{ resumePage(page) }}</p>
        </RouterLink>
      </div>
    </SectionBlock>

    <SectionBlock
      title="Operations techniques locales"
      description="Dead-letter, operations et reprise technique dans le perimetre ecole si le profil les porte reellement."
    >
      <EmptyState
        v-if="operationsPages.length === 0"
        title="Aucune operation technique visible"
        message="Ce profil ne porte actuellement aucune operation technique notifications dans l'ecole active."
      />
      <div v-else class="notif-home-card-grid">
        <RouterLink
          v-for="page in operationsPages"
          :key="page.code"
          class="notif-home-card"
          :to="page.routePath"
        >
          <span class="notif-home-badge notif-home-badge--soft">{{ page.code }}</span>
          <strong>{{ page.label }}</strong>
          <small>{{ page.sectionLabel }}</small>
          <p>{{ resumePage(page) }}</p>
        </RouterLink>
      </div>
    </SectionBlock>

    <SectionBlock
      title="Supervision organisationnelle"
      description="Escalades, supervision et temps reel organisationnel selon le niveau effectivement autorise."
    >
      <EmptyState
        v-if="organizationPages.length === 0"
        title="Aucune supervision organisationnelle visible"
        message="Ce profil ne porte actuellement aucune vue organisationnelle notifications."
      />
      <div v-else class="notif-home-card-grid">
        <RouterLink
          v-for="page in organizationPages"
          :key="page.code"
          class="notif-home-card"
          :to="page.routePath"
        >
          <span class="notif-home-badge notif-home-badge--gold">{{ page.code }}</span>
          <strong>{{ page.label }}</strong>
          <small>{{ page.sectionLabel }}</small>
          <p>{{ resumePage(page) }}</p>
        </RouterLink>
      </div>
    </SectionBlock>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import { sessionStore } from '../../../shared/auth/session.store';
import { getAccessiblePages } from '../../../shared/doctrine/doctrine.resolver';
import type { FrontendPageDoctrine } from '../../../shared/doctrine/doctrine.types';
import { activeContextStore } from '../../../shared/session/active-context.store';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import StatChip from '../../../shared/ui/StatChip.vue';

const session = sessionStore.state;
const context = activeContextStore.state;

const notificationPages = computed(() =>
  getAccessiblePages(session.actorCode, context.governanceLevel)
    .filter((page) => page.moduleCode === 'NOTIFICATIONS')
    .filter((page) => page.routePath !== '/app/notifications')
    .filter((page) => !page.routePath.includes('/:')),
);

const schoolPages = computed(() =>
  notificationPages.value.filter((page) =>
    page.routePath === '/app/notifications/ecole'
    || page.routePath.includes('/notifications/ecole/envoyer'),
  ),
);

const operationsPages = computed(() =>
  notificationPages.value.filter((page) =>
    page.routePath.includes('/notifications/ecole/operations')
    || page.routePath.includes('/notifications/ecole/dead-letter'),
  ),
);

const organizationPages = computed(() =>
  notificationPages.value.filter((page) =>
    page.routePath.includes('/notifications/organisation'),
  ),
);

const quickLinks = computed(() => {
  const priorities = [
    schoolPages.value[0],
    operationsPages.value[0],
    organizationPages.value[0],
  ].filter((page): page is FrontendPageDoctrine => page !== undefined);

  return priorities.slice(0, 3).map((page, index) => ({
    code: page.code,
    label: page.label,
    route: page.routePath,
    primary: index === 0,
  }));
});

function resumePage(page: FrontendPageDoctrine): string {
  return page.visibleActions.length > 0
    ? page.visibleActions.map((action) => action.label).join(' | ')
    : `Section ${page.sectionLabel}`;
}
</script>

<style scoped>
.notif-home-actions{display:flex;flex-wrap:wrap;gap:.85rem}
.notif-home-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.45rem;font-weight:600;text-decoration:none}
.notif-home-pill--primary{background:linear-gradient(135deg,#7a143d,#c2416c);border-color:transparent;color:#fff}
.notif-home-grid,.notif-home-card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.notif-home-card{display:grid;gap:.7rem;padding:1.1rem;border-radius:24px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);text-decoration:none;color:#11283f}
.notif-home-card small{color:#5f7587}
.notif-home-card p{margin:0;color:#587083;line-height:1.55}
.notif-home-badge{display:inline-flex;align-items:center;width:max-content;border-radius:999px;padding:.28rem .72rem;background:#fcebf3;color:#8f2758;font-size:.82rem;font-weight:700}
.notif-home-badge--soft{background:#eef5fb;color:#1b4d74}
.notif-home-badge--gold{background:#fff4de;color:#855b00}
</style>
