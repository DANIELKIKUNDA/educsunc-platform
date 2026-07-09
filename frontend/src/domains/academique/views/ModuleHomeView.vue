<template>
  <PageContainer>
    <PageHeader
      eyebrow="ACA-HOME"
      title="Centre academique"
      description="Point d entree de l exploitation academique locale. Ce centre reste borne a l ecole active, a l annee scolaire et aux parametrages d exploitation autorises."
    >
      <template #actions>
        <div class="aca-home-actions">
          <RouterLink
            v-for="link in quickLinks"
            :key="link.code"
            class="aca-home-pill"
            :class="{ 'aca-home-pill--primary': link.primary }"
            :to="link.route"
          >
            {{ link.label }}
          </RouterLink>
        </div>
      </template>
    </PageHeader>

    <SectionBlock
      title="Contexte academique actif"
      description="Le shell relit ici l acteur, le niveau et le contexte actif avant d ouvrir un ecran academique local."
    >
      <div class="aca-home-grid">
        <StatChip label="Acteur" :value="session.actorLabel" />
        <StatChip label="Niveau" :value="context.governanceLevel" />
        <StatChip label="Organisation" :value="context.organizationName" />
        <StatChip label="Ecole" :value="context.schoolName" />
        <StatChip label="Annee" :value="context.schoolYearLabel" />
        <StatChip label="Pages visibles" :value="String(academicPages.length)" />
      </div>
    </SectionBlock>

    <SectionBlock
      title="Lecture de la doctrine academique"
      description="Le module academique expose ici uniquement le bloc local ecole. Le referentiel officiel transverse reste pilote dans le module Plateforme."
    >
      <div class="aca-home-card-grid">
        <article class="aca-home-card aca-home-card--guide">
          <span class="aca-home-badge">Doctrine</span>
          <strong>Referentiel officiel hors de ce module</strong>
          <p>Les sections, options, classes academiques, cours, publications, activations et migrations officielles sont centralises dans Plateforme &gt; Referentiel officiel.</p>
        </article>
        <article class="aca-home-card aca-home-card--guide">
          <span class="aca-home-badge aca-home-badge--gold">Ecole</span>
          <strong>Exploitation locale</strong>
          <p>Annees scolaires, classes pedagogiques, responsabilites, calendriers et programmes locaux demandent un contexte ecole reel et, selon la vue, une annee scolaire active.</p>
        </article>
      </div>
    </SectionBlock>

    <SectionBlock
      title="Exploitation scolaire locale"
      description="Annees scolaires, classes pedagogiques, responsabilites, calendriers et programmes locaux visibles dans le contexte courant."
    >
      <EmptyState
        v-if="localPages.length === 0"
        title="Aucune exploitation locale visible"
        message="Ce profil ne porte actuellement aucune vue academique d'exploitation locale."
      />
      <div v-else class="aca-home-card-grid">
        <RouterLink
          v-for="page in localPages"
          :key="page.code"
          class="aca-home-card"
          :to="page.routePath"
        >
          <span class="aca-home-badge aca-home-badge--gold">{{ page.code }}</span>
          <strong>{{ page.label }}</strong>
          <small>{{ page.sectionLabel }}</small>
          <div class="aca-home-meta">
            <span v-for="marker in getMarkers(page)" :key="marker">{{ marker }}</span>
          </div>
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

const academicPages = computed(() =>
  getAccessiblePages(session.actorCode, context.governanceLevel)
    .filter((page) => page.moduleCode === 'ACADEMIQUE')
    .filter((page) => page.routePath !== '/app/academique')
    .filter((page) => !page.routePath.includes('/:')),
);

const localPages = computed(() =>
  academicPages.value.filter((page) =>
    page.routePath.includes('/academique/annees-scolaires')
    || page.routePath.includes('/academique/classes-pedagogiques')
    || page.routePath.includes('/academique/responsabilites-classes')
    || page.routePath.includes('/academique/calendriers')
    || page.routePath.includes('/academique/programmes-locaux'),
  ),
);

const quickLinks = computed(() => {
  const priorities = localPages.value.filter((page): page is FrontendPageDoctrine => page !== undefined);

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

function getMarkers(page: FrontendPageDoctrine): string[] {
  const markers: string[] = [];

  if (
    page.routePath.includes('/academique/annees-scolaires')
    || page.routePath.includes('/academique/classes-pedagogiques')
    || page.routePath.includes('/academique/responsabilites-classes')
    || page.routePath.includes('/academique/calendriers')
    || page.routePath.includes('/academique/programmes-locaux')
  ) {
    markers.push('Ecole');
  }

  if (
    page.routePath.includes('/academique/classes-pedagogiques')
    || page.routePath.includes('/academique/responsabilites-classes')
    || page.routePath.includes('/academique/calendriers')
    || page.routePath.includes('/academique/programmes-locaux')
  ) {
    markers.push('Annee active');
  }

  if (page.routePath.includes('/academique/publication') || page.routePath.includes('/academique/activation')) {
    markers.push('Version officielle');
  }

  return markers;
}
</script>

<style scoped>
.aca-home-actions{display:flex;flex-wrap:wrap;gap:.85rem}
.aca-home-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.45rem;font-weight:600;text-decoration:none}
.aca-home-pill--primary{background:linear-gradient(135deg,#14532d,#1f7a45);border-color:transparent;color:#fff}
.aca-home-grid,.aca-home-card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.aca-home-card{display:grid;gap:.7rem;padding:1.1rem;border-radius:24px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);text-decoration:none;color:#11283f}
.aca-home-card--guide{align-content:start}
.aca-home-card small{color:#5f7587}
.aca-home-card p{margin:0;color:#587083;line-height:1.55}
.aca-home-meta{display:flex;flex-wrap:wrap;gap:.5rem}
.aca-home-meta span{display:inline-flex;align-items:center;border-radius:999px;padding:.22rem .62rem;background:#f3f6f9;color:#315067;font-size:.76rem;font-weight:700}
.aca-home-badge{display:inline-flex;align-items:center;width:max-content;border-radius:999px;padding:.28rem .72rem;background:#eaf7ee;color:#1d5a36;font-size:.82rem;font-weight:700}
.aca-home-badge--soft{background:#eef5fb;color:#1b4d74}
.aca-home-badge--gold{background:#fff4de;color:#855b00}
</style>
