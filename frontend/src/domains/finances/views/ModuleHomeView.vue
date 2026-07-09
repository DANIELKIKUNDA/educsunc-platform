<template>
  <PageContainer>
    <PageHeader
      eyebrow="FIN-HOME"
      title="Centre financier"
      description="Point d'entree contextuel du moteur paiements et facturation selon l'acteur, le niveau actif et le perimetre courant."
    >
      <template #actions>
        <div class="finance-home-actions">
          <RouterLink
            v-for="link in quickLinks"
            :key="link.code"
            class="finance-home-pill"
            :class="{ 'finance-home-pill--primary': link.primary }"
            :to="link.route"
          >
            {{ link.label }}
          </RouterLink>
        </div>
      </template>
    </PageHeader>

    <SectionBlock
      title="Contexte financier actif"
      description="Le shell rappelle ici le vrai perimetre de lecture ou de mutation avant d'ouvrir une vue financiere."
    >
      <div class="finance-home-grid">
        <StatChip label="Acteur" :value="session.actorLabel" />
        <StatChip label="Niveau" :value="context.governanceLevel" />
        <StatChip label="Organisation" :value="context.organizationName" />
        <StatChip label="Ecole" :value="context.schoolName" />
        <StatChip label="Annee" :value="context.schoolYearLabel" />
        <StatChip label="Pages visibles" :value="String(financePages.length)" />
      </div>
    </SectionBlock>

    <SectionBlock
      title="Parcours prioritaire"
      description="Chemin recommande pour enchaîner perception, relecture et supervision d un eleve sans ressaisie manuelle."
    >
      <div class="finance-home-card-grid">
        <RouterLink
          v-for="step in journeySteps"
          :key="step.code"
          class="finance-home-card finance-home-card--journey"
          :to="step.route"
        >
          <span class="finance-home-badge">{{ step.code }}</span>
          <strong>{{ step.label }}</strong>
          <small>{{ step.sectionLabel }}</small>
          <p>{{ step.description }}</p>
        </RouterLink>
      </div>
    </SectionBlock>

    <SectionBlock
      title="Operations courantes"
      description="Actions de premier rang pour encaisser, piloter la caisse et consulter les situations eleves."
    >
      <EmptyState
        v-if="operationsPages.length === 0"
        title="Aucune operation visible"
        message="Ce profil n'ouvre actuellement aucune operation financiere directe dans ce perimetre."
      />
      <div v-else class="finance-home-card-grid">
        <RouterLink
          v-for="page in operationsPages"
          :key="page.code"
          class="finance-home-card"
          :to="page.routePath"
        >
          <span class="finance-home-badge">{{ page.code }}</span>
          <strong>{{ page.label }}</strong>
          <small>{{ page.sectionLabel }}</small>
          <p>{{ resumePage(page) }}</p>
        </RouterLink>
      </div>
    </SectionBlock>

    <SectionBlock
      title="Supervision et analyses"
      description="Vues de synthese, rapports et supervision de recouvrement ouvertes dans le contexte courant."
    >
      <EmptyState
        v-if="analysisPages.length === 0"
        title="Aucune analyse visible"
        message="Ce profil ne porte pas actuellement de vues analytiques financieres dans ce perimetre."
      />
      <div v-else class="finance-home-card-grid">
        <RouterLink
          v-for="page in analysisPages"
          :key="page.code"
          class="finance-home-card"
          :to="page.routePath"
        >
          <span class="finance-home-badge finance-home-badge--soft">{{ page.code }}</span>
          <strong>{{ page.label }}</strong>
          <small>{{ page.sectionLabel }}</small>
          <p>{{ resumePage(page) }}</p>
        </RouterLink>
      </div>
    </SectionBlock>

    <SectionBlock
      title="Parametrage et gouvernance"
      description="Zones de tarification, exoneration et regles de paiement si le profil les porte reellement."
    >
      <EmptyState
        v-if="governancePages.length === 0"
        title="Aucun parametrage visible"
        message="Ce profil reste operationnel ou analytique sans zone de gouvernance financiere locale."
      />
      <div v-else class="finance-home-card-grid">
        <RouterLink
          v-for="page in governancePages"
          :key="page.code"
          class="finance-home-card"
          :to="page.routePath"
        >
          <span class="finance-home-badge finance-home-badge--gold">{{ page.code }}</span>
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

const financePages = computed(() =>
  getAccessiblePages(session.actorCode, context.governanceLevel)
    .filter((page) => page.moduleCode === 'FINANCES')
    .filter((page) => page.routePath !== '/app/finances')
    .filter((page) => !page.routePath.includes('/:')),
);

const operationsPages = computed(() =>
  financePages.value.filter((page) =>
    page.routePath.includes('/paiements/')
    || page.routePath.includes('/caisse')
    || page.routePath.includes('/recus'),
  ),
);

const analysisPages = computed(() =>
  financePages.value.filter((page) =>
    page.routePath.includes('/registre-classe')
    || page.routePath.includes('/synthese-')
    || page.routePath.includes('/rapports')
    || page.routePath.includes('/dettes')
    || page.routePath.includes('/historiques')
    || page.routePath.includes('/arrieres'),
  ),
);

const governancePages = computed(() =>
  financePages.value.filter((page) =>
    page.routePath.includes('/parametres')
    || page.routePath.includes('/tarification')
    || page.routePath.includes('/exonerations'),
  ),
);

const quickLinks = computed(() => {
  const priorities = [
    operationsPages.value[0],
    analysisPages.value[0],
    governancePages.value[0],
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
    label: 'Perception de paiement',
    sectionLabel: 'Mutation de caisse',
    description: 'Verifier l eleve cible et enregistrer l operation autorisee dans le bon perimetre.',
    route: '/app/finances/paiements/enregistrer',
  },
  {
    code: 'STEP-02',
    label: 'Reçus emis',
    sectionLabel: 'Sortie documentaire',
    description: 'Relire les reçus générés et suivre la restitution documentaire des paiements.',
    route: '/app/finances/recus',
  },
  {
    code: 'STEP-03',
    label: 'Caisse du jour',
    sectionLabel: 'Supervision locale',
    description: 'Contrôler les opérations du poste de caisse actif sans exiger un élève déjà sélectionné.',
    route: '/app/finances/caisse',
  },
  {
    code: 'STEP-04',
    label: 'Registre financier de classe',
    sectionLabel: 'Pilotage de recouvrement',
    description: 'Basculer vers le suivi financier agrégé quand on quitte l’échelle d’un seul élève.',
    route: '/app/finances/registre-classe',
  },
]);

function resumePage(page: FrontendPageDoctrine): string {
  return page.visibleActions.length > 0
    ? page.visibleActions.map((action) => action.label).join(' | ')
    : `Section ${page.sectionLabel}`;
}
</script>

<style scoped>
.finance-home-actions{display:flex;flex-wrap:wrap;gap:.85rem}
.finance-home-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.45rem;font-weight:600;text-decoration:none}
.finance-home-pill--primary{background:linear-gradient(135deg,#14532d,#1f7a45);border-color:transparent;color:#fff}
.finance-home-grid,.finance-home-card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.finance-home-card{display:grid;gap:.7rem;padding:1.1rem;border-radius:24px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);text-decoration:none;color:#11283f}
.finance-home-card--journey{background:linear-gradient(180deg,#f7fbfd,#ffffff)}
.finance-home-card small{color:#5f7587}
.finance-home-card p{margin:0;color:#587083;line-height:1.55}
.finance-home-badge{display:inline-flex;align-items:center;width:max-content;border-radius:999px;padding:.28rem .72rem;background:#eaf7ee;color:#1d5a36;font-size:.82rem;font-weight:700}
.finance-home-badge--soft{background:#eef5fb;color:#1b4d74}
.finance-home-badge--gold{background:#fff4de;color:#855b00}
</style>
