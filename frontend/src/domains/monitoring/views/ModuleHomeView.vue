<template>
  <PageContainer>
    <PageHeader
      eyebrow="MON-HOME"
      title="Centre monitoring"
      description="Point d'entree plateforme pour l'etat systeme, l'observabilite, les incidents, les alertes, les diagnostics, la capacite et les traces."
    >
      <template #actions>
        <div class="mon-home-actions">
          <RouterLink
            v-for="link in quickLinks"
            :key="link.code"
            class="mon-home-pill"
            :class="{ 'mon-home-pill--primary': link.primary }"
            :to="link.route"
          >
            {{ link.label }}
          </RouterLink>
        </div>
      </template>
    </PageHeader>

    <SectionBlock
      title="Contexte monitoring actif"
      description="Le shell rappelle le niveau, l'organisation et l'ecole active, meme si ce module reste d'abord un poste de pilotage plateforme."
    >
      <div class="mon-home-grid">
        <StatChip label="Acteur" :value="session.actorLabel" />
        <StatChip label="Niveau" :value="context.governanceLevel" />
        <StatChip label="Organisation" :value="context.organizationName" />
        <StatChip label="Ecole" :value="context.schoolName" />
        <StatChip label="Annee" :value="context.schoolYearLabel" />
        <StatChip label="Pages visibles" :value="String(monitoringPages.length)" />
      </div>
    </SectionBlock>

    <SectionBlock
      title="Vue systeme et observabilite"
      description="Etat systeme, dashboard, observabilite et sante pour la lecture synthetique de la plateforme."
    >
      <EmptyState
        v-if="overviewPages.length === 0"
        title="Aucune vue systeme visible"
        message="Ce profil n'ouvre actuellement aucune vue centrale d'etat systeme ou d'observabilite."
      />
      <div v-else class="mon-home-card-grid">
        <RouterLink
          v-for="page in overviewPages"
          :key="page.code"
          class="mon-home-card"
          :to="page.routePath"
        >
          <span class="mon-home-badge">{{ page.code }}</span>
          <strong>{{ page.label }}</strong>
          <small>{{ page.sectionLabel }}</small>
          <p>{{ resumePage(page) }}</p>
        </RouterLink>
      </div>
    </SectionBlock>

    <SectionBlock
      title="Incidents et diagnostics"
      description="Lecture des alertes, incidents et diagnostics techniques pour le traitement operationnel."
    >
      <EmptyState
        v-if="incidentPages.length === 0"
        title="Aucun incident visible"
        message="Ce profil ne porte actuellement aucune vue d'incident, d'alerte ou de diagnostic."
      />
      <div v-else class="mon-home-card-grid">
        <RouterLink
          v-for="page in incidentPages"
          :key="page.code"
          class="mon-home-card"
          :to="page.routePath"
        >
          <span class="mon-home-badge mon-home-badge--soft">{{ page.code }}</span>
          <strong>{{ page.label }}</strong>
          <small>{{ page.sectionLabel }}</small>
          <p>{{ resumePage(page) }}</p>
        </RouterLink>
      </div>
    </SectionBlock>

    <SectionBlock
      title="Capacite et traces"
      description="Capacite plateforme et traces techniques pour la supervision de fond."
    >
      <EmptyState
        v-if="capacityPages.length === 0"
        title="Aucune capacite ou trace visible"
        message="Ce profil ne porte actuellement aucune vue de capacite ou de traces."
      />
      <div v-else class="mon-home-card-grid">
        <RouterLink
          v-for="page in capacityPages"
          :key="page.code"
          class="mon-home-card"
          :to="page.routePath"
        >
          <span class="mon-home-badge mon-home-badge--gold">{{ page.code }}</span>
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

const monitoringPages = computed(() =>
  getAccessiblePages(session.actorCode, context.governanceLevel)
    .filter((page) => page.moduleCode === 'MONITORING')
    .filter((page) => page.routePath !== '/app/monitoring')
    .filter((page) => !page.routePath.includes('/:')),
);

const overviewPages = computed(() =>
  monitoringPages.value.filter((page) =>
    page.routePath.includes('/monitoring/etat-systeme')
    || page.routePath.includes('/monitoring/dashboard')
    || page.routePath.includes('/monitoring/observabilite')
    || page.routePath.includes('/monitoring/sante'),
  ),
);

const incidentPages = computed(() =>
  monitoringPages.value.filter((page) =>
    page.routePath.includes('/monitoring/incidents')
    || page.routePath.includes('/monitoring/alertes')
    || page.routePath.includes('/monitoring/diagnostics'),
  ),
);

const capacityPages = computed(() =>
  monitoringPages.value.filter((page) =>
    page.routePath.includes('/monitoring/capacite')
    || page.routePath.includes('/monitoring/traces'),
  ),
);

const quickLinks = computed(() => {
  const priorities = [
    overviewPages.value[0],
    incidentPages.value[0],
    capacityPages.value[0],
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
.mon-home-actions{display:flex;flex-wrap:wrap;gap:.85rem}
.mon-home-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.45rem;font-weight:600;text-decoration:none}
.mon-home-pill--primary{background:linear-gradient(135deg,#0c4a6e,#0369a1);border-color:transparent;color:#fff}
.mon-home-grid,.mon-home-card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.mon-home-card{display:grid;gap:.7rem;padding:1.1rem;border-radius:24px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);text-decoration:none;color:#11283f}
.mon-home-card small{color:#5f7587}
.mon-home-card p{margin:0;color:#587083;line-height:1.55}
.mon-home-badge{display:inline-flex;align-items:center;width:max-content;border-radius:999px;padding:.28rem .72rem;background:#e6f6fb;color:#0f5f7d;font-size:.82rem;font-weight:700}
.mon-home-badge--soft{background:#eef5fb;color:#1b4d74}
.mon-home-badge--gold{background:#fff4de;color:#855b00}
</style>
