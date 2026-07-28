<template>
  <PageContainer>
    <PageHeader
      eyebrow="PLAT-HOME"
      title="Centre plateforme"
      description="Pilotage global du referentiel officiel et point de descente vers l'organisation puis l'ecole active."
    >
      <template #actions>
        <div class="platform-home-actions">
          <RouterLink class="platform-home-pill platform-home-pill--primary" to="/app/plateforme/referentiel">
            Referentiel officiel
          </RouterLink>
          <RouterLink class="platform-home-pill" to="/app/organisation">
            Ouvrir organisation
          </RouterLink>
          <RouterLink class="platform-home-pill" to="/app/administration-ecole">
            Ouvrir administration ecole
          </RouterLink>
        </div>
      </template>
    </PageHeader>

    <SectionBlock
      title="Contexte global"
      description="Le shell reste au niveau plateforme, mais garde la memoire du contexte aval pour accelerer la descente."
    >
      <div class="platform-home-grid">
        <StatChip label="Acteur" :value="session.actorLabel" />
        <StatChip label="Niveau" :value="context.governanceLevel" />
        <StatChip label="Organisation memorisee" :value="context.organizationName" />
        <StatChip label="Ecole memorisee" :value="context.schoolName" />
      </div>
    </SectionBlock>

    <LoadingState
      v-if="store.state.status === 'loading' && store.state.organisations.length === 0"
      title="Chargement plateforme"
      message="Lecture des organisations et du contexte aval."
    />
    <ErrorState
      v-else-if="store.state.status === 'error' && store.state.organisations.length === 0"
      title="Plateforme indisponible"
      :message="store.state.errorMessage ?? 'Le centre plateforme ne peut pas etre charge.'"
    />

    <template v-else>
      <SectionBlock
        title="Parcours prioritaire"
        description="Premier chemin reel pour descendre de la plateforme jusqu a l exploitation ecole sans perdre le contexte."
      >
        <div class="platform-home-journey-grid">
          <RouterLink
            v-for="step in journeySteps"
            :key="step.code"
            class="platform-home-journey-card"
            :to="step.route"
          >
            <span class="platform-home-badge">{{ step.code }}</span>
            <strong>{{ step.label }}</strong>
            <small>{{ step.hint }}</small>
          </RouterLink>
        </div>
      </SectionBlock>

      <SectionBlock
        title="Operations officielles"
        description="Les operations visibles sont relues depuis la doctrine du profil courant."
      >
        <div class="platform-home-card-grid">
          <RouterLink
            v-for="page in platformPages"
            :key="page.code"
            class="platform-home-card"
            :to="page.routePath"
          >
            <span class="platform-home-badge">{{ page.code }}</span>
            <strong>{{ page.label }}</strong>
            <small>{{ page.sectionLabel }}</small>
            <p>{{ page.visibleActions.map((action) => action.label).join(' | ') }}</p>
          </RouterLink>
        </div>
      </SectionBlock>

      <SectionBlock
        title="Descente organisationnelle"
        description="La plateforme peut ouvrir l'organisation courante puis promouvoir une ecole dans le contexte actif."
      >
        <EmptyState
          v-if="store.state.organisations.length === 0"
          title="Aucune organisation chargee"
          message="Relisez le registre organisationnel pour preparer la descente."
        />
        <div v-else class="platform-home-org-grid">
          <article
            v-for="organisation in store.state.organisations"
            :key="organisation.id"
            class="platform-home-org-card"
          >
            <div class="platform-home-org-card__head">
              <div>
                <small>{{ organisation.code }}</small>
                <strong>{{ organisation.nom }}</strong>
              </div>
              <span class="platform-home-badge">{{ organisation.typeOrganisation }}</span>
            </div>

            <p>
              {{ organisation.actif ? 'Organisation active' : 'Organisation inactive' }}
              · version {{ organisation.version }}.
            </p>

            <div class="platform-home-actions">
              <button class="platform-home-pill" type="button" @click="activerOrganisationDansContexte(organisation.id)">
                Activer contexte organisation
              </button>
              <RouterLink class="platform-home-pill" to="/app/organisation/ecoles">
                Ouvrir registre
              </RouterLink>
            </div>
          </article>
        </div>
      </SectionBlock>

      <SectionBlock
        title="Ecoles de l'organisation memorisee"
        description="Resume direct de l'organisation actuellement memorisee dans le shell."
      >
        <div class="platform-home-actions">
          <button class="platform-home-pill" type="button" @click="relireOrganisationMemoiree">
            Relire les ecoles memorisees
          </button>
        </div>

        <EmptyState
          v-if="store.state.ecoles.length === 0"
          title="Aucune ecole chargee"
          message="La lecture des ecoles memorisees n'a pas encore ete declenchee."
        />
        <div v-else class="platform-home-school-grid">
          <article v-for="ecole in store.state.ecoles" :key="ecole.id" class="platform-home-school-card">
            <div class="platform-home-org-card__head">
              <div>
                <small>{{ ecole.code }}</small>
                <strong>{{ ecole.nom }}</strong>
              </div>
              <span class="platform-home-badge">{{ ecole.modeExploitation }}</span>
            </div>

            <p>{{ ecole.actif ? 'Ecole active' : 'Ecole inactive' }} · detail structurel disponible.</p>

            <div class="platform-home-actions">
              <button class="platform-home-pill" type="button" @click="activerEcoleDansContexte(ecole.idOrganisation, ecole.id)">
                Activer contexte ecole
              </button>
              <RouterLink class="platform-home-pill" :to="`/app/organisation/ecoles/${ecole.id}`">
                Detail organisation
              </RouterLink>
              <RouterLink class="platform-home-pill" :to="`/app/administration-ecole/ecoles/${ecole.id}`">
                Detail administration
              </RouterLink>
            </div>
          </article>
        </div>
      </SectionBlock>
    </template>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import { changerEcoleActiveFrontend, changerOrganisationActiveFrontend } from '../../../shared/auth/session.bootstrap';
import { sessionStore } from '../../../shared/auth/session.store';
import { getAccessiblePages } from '../../../shared/doctrine/doctrine.resolver';
import { activeContextStore } from '../../../shared/session/active-context.store';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import StatChip from '../../../shared/ui/StatChip.vue';
import { useOrganizationGovernanceStore } from '../../organisation/stores/organization-governance.store';

const store = useOrganizationGovernanceStore();
const session = sessionStore.state;
const context = activeContextStore.state;

const platformPages = computed(() =>
  getAccessiblePages(session.actorCode, context.governanceLevel)
    .filter((page) => page.moduleCode === 'PLATEFORME')
    .filter((page) => page.routePath !== '/app/plateforme'),
);
const journeySteps = computed(() => [
  {
    code: 'STEP-01',
    label: 'Ouvrir le pilotage organisation',
    hint: 'Descendre de la plateforme vers le registre des organisations.',
    route: '/app/organisation',
  },
  {
    code: 'STEP-02',
    label: 'Administrer les ecoles',
    hint: 'Ouvrir la structure ecole a partir de l organisation active.',
    route: '/app/administration-ecole',
  },
  {
    code: 'STEP-03',
    label: 'Basculer en exploitation ecole',
    hint: 'Lancer ensuite la scolarite ou la finance dans le bon contexte.',
    route: '/app/scolarite',
  },
]);

async function chargerCentrePlateforme(): Promise<void> {
  await store.chargerOrganisations();
  if (context.organizationId) {
    await store.chargerEcolesParOrganisation(context.organizationId);
  }
}

async function activerOrganisationDansContexte(idOrganisation: string): Promise<void> {
  await changerOrganisationActiveFrontend(idOrganisation);
  await store.chargerEcolesParOrganisation(idOrganisation);
}

async function relireOrganisationMemoiree(): Promise<void> {
  if (!context.organizationId) {
    return;
  }

  await store.chargerEcolesParOrganisation(context.organizationId);
}

async function activerEcoleDansContexte(idOrganisation: string, idEcole: string): Promise<void> {
  await changerOrganisationActiveFrontend(idOrganisation);
  await changerEcoleActiveFrontend(idEcole);
}

onMounted(() => {
  void chargerCentrePlateforme();
});
</script>

<style scoped>
.platform-home-actions{display:flex;flex-wrap:wrap;gap:.85rem}
.platform-home-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.45rem;font-weight:600;text-decoration:none}
.platform-home-pill--primary{background:linear-gradient(135deg,#0f365d,#175f93);border-color:transparent;color:#fff}
.platform-home-grid,.platform-home-card-grid,.platform-home-org-grid,.platform-home-school-grid,.platform-home-journey-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.platform-home-card,.platform-home-org-card,.platform-home-school-card{display:grid;gap:1rem;padding:1.1rem;border-radius:24px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);text-decoration:none;color:#11283f}
.platform-home-journey-card{display:grid;gap:.7rem;padding:1.1rem;border-radius:24px;background:linear-gradient(180deg,#f7fbfd,#ffffff);border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);text-decoration:none;color:#11283f}
.platform-home-card p,.platform-home-org-card p,.platform-home-school-card p{margin:0;color:#587083;line-height:1.55}
.platform-home-journey-card small{color:#587083;line-height:1.55}
.platform-home-card__head,.platform-home-org-card__head{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start}
.platform-home-org-card__head small{display:block;color:#61788a}
.platform-home-org-card__head strong{font-size:1.05rem;color:#11283f}
.platform-home-card small{color:#486173}
.platform-home-card strong{font-size:1.02rem}
.platform-home-badge{display:inline-flex;align-items:center;border-radius:999px;padding:.28rem .72rem;background:#edf3fb;color:#1b4b73;font-size:.82rem;font-weight:700}
</style>
