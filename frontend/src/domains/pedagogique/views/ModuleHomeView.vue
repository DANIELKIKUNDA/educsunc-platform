<template>
  <PageContainer>
    <PageHeader
      eyebrow="PED-HOME"
      title="Centre pedagogique"
      description="Point d'entree du domaine pedagogique. Les vues restent strictement relues par acteur, perimetre et contexte de classe ou d'eleve avant toute mutation ou publication."
    >
      <template #actions>
        <div class="ped-home-actions">
          <RouterLink
            v-for="link in quickLinks"
            :key="link.code"
            class="ped-home-pill"
            :class="{ 'ped-home-pill--primary': link.primary }"
            :to="link.route"
          >
            {{ link.label }}
          </RouterLink>
        </div>
      </template>
    </PageHeader>

    <SectionBlock
      title="Contexte pedagogique actif"
      description="Toutes les mutations et lectures restent relues depuis l'acteur courant, le niveau actif, l'ecole, la section et l'annee scolaire."
    >
      <div class="ped-home-grid">
        <StatChip label="Acteur" :value="session.actorLabel" />
        <StatChip label="Niveau" :value="context.governanceLevel" />
        <StatChip label="Organisation" :value="context.organizationName" />
        <StatChip label="Ecole" :value="context.schoolName" />
        <StatChip label="Section" :value="context.sectionName" />
        <StatChip label="Annee" :value="context.schoolYearLabel" />
        <StatChip label="Pages visibles" :value="String(pedagogicPages.length)" />
      </div>
    </SectionBlock>

    <SectionBlock
      title="Avant d'ouvrir une vue pedagogique"
      description="Le domaine pedagogique n'ouvre pas des pages generiques. Chaque workflow exige un contexte reel avant de devenir operable."
    >
      <div class="ped-home-card-grid">
        <article class="ped-home-card ped-home-card--guide">
          <span class="ped-home-badge">Classe</span>
          <strong>Contexte de classe obligatoire</strong>
          <p>Fiche de cotation, conduite, statistiques, classements et proclamations exigent une classe pedagogique active dans l'annee scolaire courante.</p>
        </article>
        <article class="ped-home-card ped-home-card--guide">
          <span class="ped-home-badge ped-home-badge--soft">Colonne</span>
          <strong>Colonne pedagogique selon le workflow</strong>
          <p>Les analyses, statistiques, classements et proclamations demandent aussi la colonne cible: periode, semestre, total ou total general selon la doctrine backend.</p>
        </article>
        <article class="ped-home-card ped-home-card--guide">
          <span class="ped-home-badge ped-home-badge--gold">Eleve</span>
          <strong>Contexte eleve pour les sorties individuelles</strong>
          <p>Le detail de resultat et la generation de bulletin exigent un eleve cible, avec l'inscription scolaire correspondante quand le backend le demande.</p>
        </article>
      </div>
    </SectionBlock>

    <SectionBlock
      title="Vues de classe"
      description="Workflows qui deviennent exploitables des qu'une classe pedagogique est selectionnee dans le bon perimetre."
    >
      <EmptyState
        v-if="classScopedPages.length === 0"
        title="Aucune vue de classe visible"
        message="Ce profil ne porte actuellement aucun workflow pedagogique exploitable a l'echelle d'une classe."
      />
      <div v-else class="ped-home-card-grid">
        <RouterLink
          v-for="page in classScopedPages"
          :key="page.code"
          class="ped-home-card"
          :to="page.routePath"
        >
          <span class="ped-home-badge">{{ page.code }}</span>
          <strong>{{ page.label }}</strong>
          <small>{{ page.sectionLabel }}</small>
          <div class="ped-home-meta">
            <span v-for="requirement in getRequirements(page)" :key="requirement">{{ requirement }}</span>
          </div>
          <p>{{ resumePage(page) }}</p>
        </RouterLink>
      </div>
    </SectionBlock>

    <SectionBlock
      title="Vues eleve et analyse"
      description="Lectures pedagogiques qui exigent un eleve cible, ou un contexte de classe enrichi pour la lecture detaillee."
    >
      <EmptyState
        v-if="studentScopedPages.length === 0"
        title="Aucune vue eleve visible"
        message="Ce profil ne porte actuellement aucune lecture pedagogique contextualisee sur un eleve ou un detail d'analyse."
      />
      <div v-else class="ped-home-card-grid">
        <RouterLink
          v-for="page in studentScopedPages"
          :key="page.code"
          class="ped-home-card"
          :to="page.routePath"
        >
          <span class="ped-home-badge ped-home-badge--soft">{{ page.code }}</span>
          <strong>{{ page.label }}</strong>
          <small>{{ page.sectionLabel }}</small>
          <div class="ped-home-meta">
            <span v-for="requirement in getRequirements(page)" :key="requirement">{{ requirement }}</span>
          </div>
          <p>{{ resumePage(page) }}</p>
        </RouterLink>
      </div>
    </SectionBlock>

    <SectionBlock
      title="Sorties et publications"
      description="Publications pedagogiques disponibles seulement si le contexte requis est complet avant l'appel backend."
    >
      <EmptyState
        v-if="publicationPages.length === 0"
        title="Aucune publication visible"
        message="Ce profil ne porte actuellement aucune sortie de publication pedagogique dans ce perimetre."
      />
      <div v-else class="ped-home-card-grid">
        <RouterLink
          v-for="page in publicationPages"
          :key="page.code"
          class="ped-home-card"
          :to="page.routePath"
        >
          <span class="ped-home-badge ped-home-badge--gold">{{ page.code }}</span>
          <strong>{{ page.label }}</strong>
          <small>{{ page.sectionLabel }}</small>
          <div class="ped-home-meta">
            <span v-for="requirement in getRequirements(page)" :key="requirement">{{ requirement }}</span>
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

const pedagogicPages = computed(() =>
  getAccessiblePages(session.actorCode, context.governanceLevel)
    .filter((page) => page.moduleCode === 'PEDAGOGIQUE')
    .filter((page) => page.routePath !== '/app/pedagogique')
    .filter((page) => !page.routePath.includes('/:')),
);

const classScopedPages = computed(() =>
  pedagogicPages.value.filter((page) => {
    const requirements = getRequirements(page);
    return requirements.includes('Classe');
  }).filter((page) =>
    !page.routePath.includes('/bulletins/')
    && !page.routePath.includes('/classements/')
    && !page.routePath.includes('/proclamations/'),
  ),
);

const studentScopedPages = computed(() =>
  pedagogicPages.value.filter((page) => {
    const requirements = getRequirements(page);
    return requirements.includes('Eleve');
  }).filter((page) => !page.routePath.includes('/bulletins/')),
);

const publicationPages = computed(() =>
  pedagogicPages.value.filter((page) =>
    page.routePath.includes('/classements/')
    || page.routePath.includes('/bulletins/')
    || page.routePath.includes('/proclamations/'),
  ),
);

const quickLinks = computed(() => {
  const priorities = [
    classScopedPages.value[0],
    studentScopedPages.value[0],
    publicationPages.value[0],
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

function getRequirements(page: FrontendPageDoctrine): string[] {
  const requirements: string[] = [];

  if (
    page.routePath.includes('/fiches-cotation')
    || page.routePath.includes('/conduite')
    || page.routePath.includes('/statistiques/')
    || page.routePath.includes('/classements/')
    || page.routePath.includes('/proclamations/')
    || page.routePath.includes('/resultats/analyses')
    || page.routePath.includes('/bulletins/')
  ) {
    requirements.push('Classe');
  }

  if (
    page.routePath.includes('/resultats/analyses')
    || page.routePath.includes('/statistiques/')
    || page.routePath.includes('/classements/')
    || page.routePath.includes('/proclamations/')
  ) {
    requirements.push('Colonne');
  }

  if (
    page.routePath.includes('/resultats/detail')
    || page.routePath.includes('/bulletins/')
    || page.routePath.includes('/resultats/analyses')
  ) {
    requirements.push('Eleve');
  }

  if (page.routePath.includes('/fiches-cotation')) {
    requirements.push('Cours');
  }

  if (page.routePath.includes('/bulletins/')) {
    requirements.push('Inscription');
  }

  if (page.routePath.includes('/proclamations/')) {
    requirements.push('Type');
  }

  return requirements;
}
</script>

<style scoped>
.ped-home-actions{display:flex;flex-wrap:wrap;gap:.85rem}
.ped-home-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.45rem;font-weight:600;text-decoration:none}
.ped-home-pill--primary{background:linear-gradient(135deg,#7c2d12,#b45309);border-color:transparent;color:#fff}
.ped-home-grid,.ped-home-card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.ped-home-card{display:grid;gap:.7rem;padding:1.1rem;border-radius:24px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);text-decoration:none;color:#11283f}
.ped-home-card--guide{align-content:start}
.ped-home-card small{color:#5f7587}
.ped-home-card p{margin:0;color:#587083;line-height:1.55}
.ped-home-meta{display:flex;flex-wrap:wrap;gap:.5rem}
.ped-home-meta span{display:inline-flex;align-items:center;border-radius:999px;padding:.22rem .62rem;background:#f3f6f9;color:#315067;font-size:.76rem;font-weight:700}
.ped-home-badge{display:inline-flex;align-items:center;width:max-content;border-radius:999px;padding:.28rem .72rem;background:#fff1e8;color:#9a4c12;font-size:.82rem;font-weight:700}
.ped-home-badge--soft{background:#eef5fb;color:#1b4d74}
.ped-home-badge--gold{background:#fff4de;color:#855b00}
</style>
