<template>
  <PageContainer>
    <PageHeader
      eyebrow="AUD-HOME"
      title="Centre audit"
      description="Point d'entree des lectures d'audit par niveau: plateforme, organisation, ecole et pedagogique, selon les permissions et perimetres reels."
    >
      <template #actions>
        <div class="audit-home-actions">
          <RouterLink
            v-for="link in quickLinks"
            :key="link.code"
            class="audit-home-pill"
            :class="{ 'audit-home-pill--primary': link.primary }"
            :to="link.route"
          >
            {{ link.label }}
          </RouterLink>
        </div>
      </template>
    </PageHeader>

    <SectionBlock
      title="Contexte audit actif"
      description="Le shell rappelle ici l'acteur, le niveau et le contexte actif qui bornent les traces consultables."
    >
      <div class="audit-home-grid">
        <StatChip label="Acteur" :value="session.actorLabel" />
        <StatChip label="Niveau" :value="context.governanceLevel" />
        <StatChip label="Organisation" :value="context.organizationName" />
        <StatChip label="Ecole" :value="context.schoolName" />
        <StatChip label="Annee" :value="context.schoolYearLabel" />
        <StatChip label="Pages visibles" :value="String(auditPages.length)" />
      </div>
    </SectionBlock>

    <SectionBlock
      title="Audit plateforme et organisation"
      description="Les lectures globales de gouvernance et de pilotage organisationnel exposees par le backend."
    >
      <EmptyState
        v-if="governancePages.length === 0"
        title="Aucun audit global visible"
        message="Ce profil n'ouvre actuellement aucune vue d'audit plateforme ou organisation."
      />
      <div v-else class="audit-home-card-grid">
        <RouterLink
          v-for="page in governancePages"
          :key="page.code"
          class="audit-home-card"
          :to="page.routePath"
        >
          <span class="audit-home-badge">{{ page.code }}</span>
          <strong>{{ page.label }}</strong>
          <small>{{ page.sectionLabel }}</small>
          <p>{{ resumePage(page) }}</p>
        </RouterLink>
      </div>
    </SectionBlock>

    <SectionBlock
      title="Audit ecole"
      description="Pistes administratives, financieres et techniques visibles au niveau ecole selon le perimetre reel."
    >
      <EmptyState
        v-if="schoolPages.length === 0"
        title="Aucun audit ecole visible"
        message="Ce profil ne porte actuellement aucune vue d'audit administratif, financier ou technique d'ecole."
      />
      <div v-else class="audit-home-card-grid">
        <RouterLink
          v-for="page in schoolPages"
          :key="page.code"
          class="audit-home-card"
          :to="page.routePath"
        >
          <span class="audit-home-badge audit-home-badge--soft">{{ page.code }}</span>
          <strong>{{ page.label }}</strong>
          <small>{{ page.sectionLabel }}</small>
          <p>{{ resumePage(page) }}</p>
        </RouterLink>
      </div>
    </SectionBlock>

    <SectionBlock
      title="Audit pedagogique"
      description="Traces pedagogiques specialisees sur les cotes, la conduite, les bulletins et les classements."
    >
      <EmptyState
        v-if="pedagogicPages.length === 0"
        title="Aucun audit pedagogique visible"
        message="Ce profil ne porte actuellement aucune vue d'audit pedagogique specialise."
      />
      <div v-else class="audit-home-card-grid">
        <RouterLink
          v-for="page in pedagogicPages"
          :key="page.code"
          class="audit-home-card"
          :to="page.routePath"
        >
          <span class="audit-home-badge audit-home-badge--gold">{{ page.code }}</span>
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

const auditPages = computed(() =>
  getAccessiblePages(session.actorCode, context.governanceLevel)
    .filter((page) => page.moduleCode === 'AUDIT')
    .filter((page) => page.routePath !== '/app/audit')
    .filter((page) => !page.routePath.includes('/:')),
);

const governancePages = computed(() =>
  auditPages.value.filter((page) =>
    page.routePath.includes('/audit/plateforme')
    || page.routePath.includes('/audit/organisation'),
  ),
);

const schoolPages = computed(() =>
  auditPages.value.filter((page) =>
    page.routePath.includes('/audit/ecole/administratif-financier')
    || page.routePath.includes('/audit/ecole/technique'),
  ),
);

const pedagogicPages = computed(() =>
  auditPages.value.filter((page) =>
    page.routePath.includes('/audit/pedagogique/'),
  ),
);

const quickLinks = computed(() => {
  const priorities = [
    governancePages.value[0],
    schoolPages.value[0],
    pedagogicPages.value[0],
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
.audit-home-actions{display:flex;flex-wrap:wrap;gap:.85rem}
.audit-home-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.45rem;font-weight:600;text-decoration:none}
.audit-home-pill--primary{background:linear-gradient(135deg,#4b1d95,#2563eb);border-color:transparent;color:#fff}
.audit-home-grid,.audit-home-card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.audit-home-card{display:grid;gap:.7rem;padding:1.1rem;border-radius:24px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);text-decoration:none;color:#11283f}
.audit-home-card small{color:#5f7587}
.audit-home-card p{margin:0;color:#587083;line-height:1.55}
.audit-home-badge{display:inline-flex;align-items:center;width:max-content;border-radius:999px;padding:.28rem .72rem;background:#eef2ff;color:#3b4ea0;font-size:.82rem;font-weight:700}
.audit-home-badge--soft{background:#eef5fb;color:#1b4d74}
.audit-home-badge--gold{background:#fff4de;color:#855b00}
</style>
