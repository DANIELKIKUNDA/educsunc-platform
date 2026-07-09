<template>
  <PageContainer>
    <PageHeader
      eyebrow="SEC-HOME"
      title="Centre security"
      description="Point d'entree transverse pour les roles, affectations, scopes, titulariats, verifications et audit security."
    >
      <template #actions>
        <div class="sec-home-actions">
          <RouterLink
            v-for="link in quickLinks"
            :key="link.code"
            class="sec-home-pill"
            :class="{ 'sec-home-pill--primary': link.primary }"
            :to="link.route"
          >
            {{ link.label }}
          </RouterLink>
        </div>
      </template>
    </PageHeader>

    <SectionBlock
      title="Contexte security actif"
      description="Le shell rappelle ici l'acteur courant et le perimetre actif avant toute mutation du socle shared/security."
    >
      <div class="sec-home-grid">
        <StatChip label="Acteur" :value="session.actorLabel" />
        <StatChip label="Niveau" :value="context.governanceLevel" />
        <StatChip label="Organisation" :value="context.organizationName" />
        <StatChip label="Ecole" :value="context.schoolName" />
        <StatChip label="Annee" :value="context.schoolYearLabel" />
        <StatChip label="Pages visibles" :value="String(securityPages.length)" />
      </div>
    </SectionBlock>

    <SectionBlock
      title="Referentiel des roles"
      description="Lecture et relecture des roles security exposes dans le socle transverse."
    >
      <EmptyState
        v-if="rolePages.length === 0"
        title="Aucun role visible"
        message="Ce profil n'ouvre actuellement aucune vue de referentiel des roles."
      />
      <div v-else class="sec-home-card-grid">
        <RouterLink
          v-for="page in rolePages"
          :key="page.code"
          class="sec-home-card"
          :to="page.routePath"
        >
          <span class="sec-home-badge">{{ page.code }}</span>
          <strong>{{ page.label }}</strong>
          <small>{{ page.sectionLabel }}</small>
          <p>{{ resumePage(page) }}</p>
        </RouterLink>
      </div>
    </SectionBlock>

    <SectionBlock
      title="Affectations, scopes et titulariats"
      description="Gouvernance des affectations security et des perimetres effectifs portees par shared/security."
    >
      <EmptyState
        v-if="assignmentPages.length === 0"
        title="Aucune affectation visible"
        message="Ce profil ne porte actuellement aucune vue d'affectation ou de titulariat."
      />
      <div v-else class="sec-home-card-grid">
        <RouterLink
          v-for="page in assignmentPages"
          :key="page.code"
          class="sec-home-card"
          :to="page.routePath"
        >
          <span class="sec-home-badge sec-home-badge--soft">{{ page.code }}</span>
          <strong>{{ page.label }}</strong>
          <small>{{ page.sectionLabel }}</small>
          <p>{{ resumePage(page) }}</p>
        </RouterLink>
      </div>
    </SectionBlock>

    <SectionBlock
      title="Verifications et audit"
      description="Controles doctrinaux, audit security et relecture des garanties transverses."
    >
      <EmptyState
        v-if="controlPages.length === 0"
        title="Aucun controle visible"
        message="Ce profil ne porte actuellement aucune vue de verification ou d'audit security."
      />
      <div v-else class="sec-home-card-grid">
        <RouterLink
          v-for="page in controlPages"
          :key="page.code"
          class="sec-home-card"
          :to="page.routePath"
        >
          <span class="sec-home-badge sec-home-badge--gold">{{ page.code }}</span>
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

const securityPages = computed(() =>
  getAccessiblePages(session.actorCode, context.governanceLevel)
    .filter((page) => page.moduleCode === 'SECURITY')
    .filter((page) => page.routePath !== '/app/security')
    .filter((page) => !page.routePath.includes('/:')),
);

const rolePages = computed(() =>
  securityPages.value.filter((page) =>
    page.routePath.includes('/security/roles'),
  ),
);

const assignmentPages = computed(() =>
  securityPages.value.filter((page) =>
    page.routePath.includes('/security/affectations')
    || page.routePath.includes('/security/titulariats'),
  ),
);

const controlPages = computed(() =>
  securityPages.value.filter((page) =>
    page.routePath.includes('/security/verifications')
    || page.routePath.includes('/security/audit'),
  ),
);

const quickLinks = computed(() => {
  const priorities = [
    rolePages.value[0],
    assignmentPages.value[0],
    controlPages.value[0],
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
.sec-home-actions{display:flex;flex-wrap:wrap;gap:.85rem}
.sec-home-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.45rem;font-weight:600;text-decoration:none}
.sec-home-pill--primary{background:linear-gradient(135deg,#243b53,#344e7a);border-color:transparent;color:#fff}
.sec-home-grid,.sec-home-card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.sec-home-card{display:grid;gap:.7rem;padding:1.1rem;border-radius:24px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);text-decoration:none;color:#11283f}
.sec-home-card small{color:#5f7587}
.sec-home-card p{margin:0;color:#587083;line-height:1.55}
.sec-home-badge{display:inline-flex;align-items:center;width:max-content;border-radius:999px;padding:.28rem .72rem;background:#edf2f7;color:#31465a;font-size:.82rem;font-weight:700}
.sec-home-badge--soft{background:#eef5fb;color:#1b4d74}
.sec-home-badge--gold{background:#fff4de;color:#855b00}
</style>
