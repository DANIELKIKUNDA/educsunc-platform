<template>
  <PageContainer>
    <PageHeader
      eyebrow="CFG-HOME"
      title="Centre configuration"
      description="Point d'entree de gouvernance pour les configurations plateforme, organisation, ecole et preferences utilisateur dans le contexte actif."
    >
      <template #actions>
        <div class="cfg-home-actions">
          <RouterLink
            v-for="link in quickLinks"
            :key="link.code"
            class="cfg-home-pill"
            :class="{ 'cfg-home-pill--primary': link.primary }"
            :to="link.route"
          >
            {{ link.label }}
          </RouterLink>
        </div>
      </template>
    </PageHeader>

    <SectionBlock
      title="Contexte de gouvernance actif"
      description="La lecture et la mutation des cles restent bornees par le niveau actif, l'organisation, l'ecole et l'acteur courant."
    >
      <div class="cfg-home-grid">
        <StatChip label="Acteur" :value="session.actorLabel" />
        <StatChip label="Niveau" :value="context.governanceLevel" />
        <StatChip label="Organisation" :value="context.organizationName" />
        <StatChip label="Ecole" :value="context.schoolName" />
        <StatChip label="Annee" :value="context.schoolYearLabel" />
        <StatChip label="Pages visibles" :value="String(configurationPages.length)" />
      </div>
    </SectionBlock>

    <SectionBlock
      title="Configuration plateforme"
      description="Clés runtime et politiques techniques globales visibles pour les acteurs de niveau SYSTEM."
    >
      <EmptyState
        v-if="platformPages.length === 0"
        title="Aucune configuration plateforme visible"
        message="Ce profil n'ouvre actuellement aucun ecran de configuration runtime au niveau plateforme."
      />
      <div v-else class="cfg-home-card-grid">
        <RouterLink
          v-for="page in platformPages"
          :key="page.code"
          class="cfg-home-card"
          :to="page.routePath"
        >
          <span class="cfg-home-badge">{{ page.code }}</span>
          <strong>{{ page.label }}</strong>
          <small>{{ page.sectionLabel }}</small>
          <p>{{ resumePage(page) }}</p>
        </RouterLink>
      </div>
    </SectionBlock>

    <SectionBlock
      title="Configuration organisation et ecole"
      description="Modules, branding et politiques locales selon le perimetre effectivement autorise."
    >
      <EmptyState
        v-if="governancePages.length === 0"
        title="Aucune configuration locale visible"
        message="Ce profil ne porte actuellement aucune zone de gouvernance organisationnelle ou ecole."
      />
      <div v-else class="cfg-home-card-grid">
        <RouterLink
          v-for="page in governancePages"
          :key="page.code"
          class="cfg-home-card"
          :to="page.routePath"
        >
          <span class="cfg-home-badge cfg-home-badge--soft">{{ page.code }}</span>
          <strong>{{ page.label }}</strong>
          <small>{{ page.sectionLabel }}</small>
          <p>{{ resumePage(page) }}</p>
        </RouterLink>
      </div>
    </SectionBlock>

    <SectionBlock
      title="Preferences utilisateur"
      description="Espace personnel et preferences finales autorisees pour l'utilisateur courant."
    >
      <EmptyState
        v-if="userPages.length === 0"
        title="Aucune preference visible"
        message="Ce profil n'ouvre actuellement aucun ecran de preferences personnelles."
      />
      <div v-else class="cfg-home-card-grid">
        <RouterLink
          v-for="page in userPages"
          :key="page.code"
          class="cfg-home-card"
          :to="page.routePath"
        >
          <span class="cfg-home-badge cfg-home-badge--gold">{{ page.code }}</span>
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

const configurationPages = computed(() =>
  getAccessiblePages(session.actorCode, context.governanceLevel)
    .filter((page) => page.moduleCode === 'CONFIGURATION')
    .filter((page) => page.routePath !== '/app/configuration')
    .filter((page) => !page.routePath.includes('/:')),
);

const platformPages = computed(() =>
  configurationPages.value.filter((page) =>
    page.routePath.includes('/configuration/plateforme/'),
  ),
);

const governancePages = computed(() =>
  configurationPages.value.filter((page) =>
    page.routePath.includes('/configuration/organisation')
    || page.routePath.includes('/configuration/ecole/'),
  ),
);

const userPages = computed(() =>
  configurationPages.value.filter((page) =>
    page.routePath.includes('/configuration/utilisateur/')
    || page.routePath.includes('/moi/preferences'),
  ),
);

const quickLinks = computed(() => {
  const priorities = [
    platformPages.value[0],
    governancePages.value[0],
    userPages.value[0],
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
.cfg-home-actions{display:flex;flex-wrap:wrap;gap:.85rem}
.cfg-home-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.45rem;font-weight:600;text-decoration:none}
.cfg-home-pill--primary{background:linear-gradient(135deg,#0f3d5e,#0c6b58);border-color:transparent;color:#fff}
.cfg-home-grid,.cfg-home-card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.cfg-home-card{display:grid;gap:.7rem;padding:1.1rem;border-radius:24px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);text-decoration:none;color:#11283f}
.cfg-home-card small{color:#5f7587}
.cfg-home-card p{margin:0;color:#587083;line-height:1.55}
.cfg-home-badge{display:inline-flex;align-items:center;width:max-content;border-radius:999px;padding:.28rem .72rem;background:#e8f5f1;color:#17624d;font-size:.82rem;font-weight:700}
.cfg-home-badge--soft{background:#eef5fb;color:#1b4d74}
.cfg-home-badge--gold{background:#fff4de;color:#855b00}
</style>
