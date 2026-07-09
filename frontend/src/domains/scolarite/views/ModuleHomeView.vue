<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCO-HOME"
      title="Centre scolarite"
      description="Point d'entree terrain pour l'inscription, les familles, les eleves, les affectations et le cycle de vie dans le perimetre actif."
    >
      <template #actions>
        <div class="school-home-actions">
          <RouterLink
            v-for="link in quickLinks"
            :key="link.code"
            class="school-home-pill"
            :class="{ 'school-home-pill--primary': link.primary }"
            :to="link.route"
          >
            {{ link.label }}
          </RouterLink>
        </div>
      </template>
    </PageHeader>

    <SectionBlock
      title="Contexte scolaire actif"
      description="Les workflows ci-dessous restent toujours relus depuis le niveau, l'organisation, l'ecole et l'annee active."
    >
      <div class="school-home-grid">
        <StatChip label="Acteur" :value="session.actorLabel" />
        <StatChip label="Niveau" :value="context.governanceLevel" />
        <StatChip label="Organisation" :value="context.organizationName" />
        <StatChip label="Ecole" :value="context.schoolName" />
        <StatChip label="Section" :value="context.sectionName" />
        <StatChip label="Annee" :value="context.schoolYearLabel" />
      </div>
    </SectionBlock>

    <SectionBlock
      title="Parcours prioritaire"
      description="Chemin recommande pour exploiter la scolarite sans casser le flux reel eleve vers paiement."
    >
      <div class="school-home-card-grid">
        <RouterLink
          v-for="step in journeySteps"
          :key="step.code"
          class="school-home-card school-home-card--journey"
          :to="step.route"
        >
          <span class="school-home-badge">{{ step.code }}</span>
          <strong>{{ step.label }}</strong>
          <small>{{ step.sectionLabel }}</small>
          <p>{{ step.description }}</p>
        </RouterLink>
      </div>
    </SectionBlock>

    <SectionBlock
      title="Flux d'entree"
      description="Inscription, gestion des eleves et familles: les points d'entree operationnels les plus frequents."
    >
      <EmptyState
        v-if="entryPages.length === 0"
        title="Aucun flux d'entree visible"
        message="Ce profil ne porte actuellement aucun workflow d'entree scolarite dans ce perimetre."
      />
      <div v-else class="school-home-card-grid">
        <RouterLink
          v-for="page in entryPages"
          :key="page.code"
          class="school-home-card"
          :to="page.routePath"
        >
          <span class="school-home-badge">{{ page.code }}</span>
          <strong>{{ page.label }}</strong>
          <small>{{ page.sectionLabel }}</small>
          <p>{{ resumePage(page) }}</p>
        </RouterLink>
      </div>
    </SectionBlock>

    <SectionBlock
      title="Affectations et pilotage de classe"
      description="Les affectations de classe et le pilotage du parcours eleve restent regroupes ici."
    >
      <EmptyState
        v-if="assignmentPages.length === 0"
        title="Aucune affectation visible"
        message="Ce profil ne porte pas actuellement de vue d'affectation dans ce perimetre."
      />
      <div v-else class="school-home-card-grid">
        <RouterLink
          v-for="page in assignmentPages"
          :key="page.code"
          class="school-home-card"
          :to="page.routePath"
        >
          <span class="school-home-badge school-home-badge--soft">{{ page.code }}</span>
          <strong>{{ page.label }}</strong>
          <small>{{ page.sectionLabel }}</small>
          <p>{{ resumePage(page) }}</p>
        </RouterLink>
      </div>
    </SectionBlock>

    <SectionBlock
      title="Cycle de vie et situations sensibles"
      description="Suspensions, transitions et mutations du parcours scolaire dans le perimetre courant."
    >
      <EmptyState
        v-if="lifecyclePages.length === 0"
        title="Aucune situation sensible visible"
        message="Ce profil ne porte actuellement aucune vue de cycle de vie ou de suspension."
      />
      <div v-else class="school-home-card-grid">
        <RouterLink
          v-for="page in lifecyclePages"
          :key="page.code"
          class="school-home-card"
          :to="page.routePath"
        >
          <span class="school-home-badge school-home-badge--alert">{{ page.code }}</span>
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

const schoolPages = computed(() =>
  getAccessiblePages(session.actorCode, context.governanceLevel)
    .filter((page) => page.moduleCode === 'SCOLARITE')
    .filter((page) => page.routePath !== '/app/scolarite'),
);

const entryPages = computed(() =>
  schoolPages.value.filter((page) =>
    page.routePath.includes('/inscriptions')
    || page.routePath.includes('/eleves')
    || page.routePath.includes('/familles'),
  ),
);

const assignmentPages = computed(() =>
  schoolPages.value.filter((page) =>
    page.routePath.includes('/affectations'),
  ),
);

const lifecyclePages = computed(() =>
  schoolPages.value.filter((page) =>
    page.routePath.includes('/cycle-vie')
    || page.routePath.includes('/suspensions'),
  ),
);

const quickLinks = computed(() => {
  const priorities = [
    entryPages.value[0],
    assignmentPages.value[0],
    lifecyclePages.value[0],
  ].filter((page): page is FrontendPageDoctrine => page !== undefined);

  return priorities.slice(0, 3).map((page, index) => ({
    code: page.code,
    label: page.label,
    route: page.routePath,
    primary: index === 0,
  }));
});
const journeySteps = computed(() => [
  {
    code: 'STEP-01',
    label: 'Gerer les familles',
    sectionLabel: 'Preparation administrative',
    description: 'Creer ou relire la famille avant de lier l eleve au bon foyer.',
    route: '/app/scolarite/familles',
  },
  {
    code: 'STEP-02',
    label: 'Conduire l inscription',
    sectionLabel: 'Mutation complete',
    description: 'Poser l eleve, l inscription annuelle et l affectation immediate si la classe est connue.',
    route: '/app/scolarite/inscriptions',
  },
  {
    code: 'STEP-03',
    label: 'Relire les eleves',
    sectionLabel: 'Verification',
    description: 'Verifier la fiche eleve et ses rattachements avant la perception financiere.',
    route: '/app/scolarite/eleves',
  },
  {
    code: 'STEP-04',
    label: 'Finaliser en finance',
    sectionLabel: 'Suite inter-module',
    description: 'Passer au paiement de l eleve dans le meme contexte ecole.',
    route: '/app/finances/paiements/enregistrer',
  },
]);

function resumePage(page: FrontendPageDoctrine): string {
  return page.visibleActions.length > 0
    ? page.visibleActions.map((action) => action.label).join(' | ')
    : `Section ${page.sectionLabel}`;
}
</script>

<style scoped>
.school-home-actions{display:flex;flex-wrap:wrap;gap:.85rem}
.school-home-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.45rem;font-weight:600;text-decoration:none}
.school-home-pill--primary{background:linear-gradient(135deg,#0f4c81,#1a73b8);border-color:transparent;color:#fff}
.school-home-grid,.school-home-card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.school-home-card{display:grid;gap:.7rem;padding:1.1rem;border-radius:24px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);text-decoration:none;color:#11283f}
.school-home-card--journey{background:linear-gradient(180deg,#f7fbfd,#ffffff)}
.school-home-card small{color:#5f7587}
.school-home-card p{margin:0;color:#587083;line-height:1.55}
.school-home-badge{display:inline-flex;align-items:center;width:max-content;border-radius:999px;padding:.28rem .72rem;background:#eaf3fb;color:#1e5077;font-size:.82rem;font-weight:700}
.school-home-badge--soft{background:#eef8fb;color:#1f5e63}
.school-home-badge--alert{background:#fff0f0;color:#8d3030}
</style>
