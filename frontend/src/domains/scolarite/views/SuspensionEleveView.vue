<template>
  <PageContainer>
    <PageHeader eyebrow="MS-06" title="Suspension eleve" description="Vue ciblee pour l encodage d une suspension dans le bon perimetre." />

    <SectionBlock title="Doctrine de suspension" description="Le directeur de discipline ne porte ici que la suspension, jamais les autres mutations.">
      <div class="scolarite-callout">
        <ShieldCheck />
        <p>{{ perimeterMessage }}</p>
      </div>
    </SectionBlock>

    <AccessBoundary page-code="SCO-006">
      <ErrorState
        v-if="!isAuthorized"
        title="Suspension non autorisee"
        message="Cette vue reste reservee au directeur de discipline et aux gestionnaires pedagogiques de leur section."
      />

      <template v-else>
        <SectionBlock title="Action ciblee" description="La suspension reste une mutation breve, explicite et historisee.">
          <div class="scolarite-grid">
            <label class="scolarite-field"><span>Id eleve</span><input v-model="idEleve" type="text" placeholder="eleve-uuid" /></label>
            <label class="scolarite-field"><span>Version attendue</span><input v-model.number="versionAttendue" type="number" min="1" /></label>
          </div>
          <div class="scolarite-actions">
            <button class="scolarite-primary-action" type="button" @click="charger"><Search /><span>Charger l eleve</span></button>
            <button v-if="canSuspendStudent" class="scolarite-secondary-action" type="button" @click="suspendre">Suspendre</button>
          </div>
        </SectionBlock>

        <LoadingState v-if="store.state.status === 'loading'" title="Suspension en cours" message="Lecture ou mutation en cours." />
        <ErrorState v-else-if="store.state.status === 'error'" title="Suspension indisponible" :message="store.state.errorMessage ?? 'Le workflow ne peut pas etre ouvert.'" />

        <template v-else-if="store.state.eleve">
          <SectionBlock v-if="store.state.successMessage" title="Confirmation" description="Retour immediat de la mutation de suspension.">
            <div class="scolarite-feedback-banner">{{ store.state.successMessage }}</div>
          </SectionBlock>

          <SectionBlock title="Resume eleve" description="Le statut courant reste visible avant et apres l action.">
            <div class="scolarite-kpi-grid">
              <div class="scolarite-kpi-card"><small>Nom complet</small><strong>{{ nomComplet }}</strong></div>
              <div class="scolarite-kpi-card"><small>Statut</small><strong>{{ store.state.eleve.statutGlobal }}</strong></div>
              <div class="scolarite-kpi-card"><small>Version</small><strong>{{ store.state.eleve.version }}</strong></div>
              <div class="scolarite-kpi-card"><small>Derniere mutation</small><strong>{{ store.state.lastMutation ?? '-' }}</strong></div>
            </div>
          </SectionBlock>

          <SectionBlock title="Historique recent" description="La suspension reste relue avec les evenements de parcours deja historises par le backend.">
            <div class="scolarite-timeline">
              <article v-for="event in evenementsRecents" :key="event.idEvenementParcours" class="scolarite-timeline__item">
                <strong>{{ event.typeEvenement }}</strong>
                <small>{{ event.dateEvenement }}</small>
                <small>{{ event.description ?? 'Sans description' }}</small>
                <small>{{ event.declenchePar }}</small>
              </article>
            </div>
          </SectionBlock>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Search, ShieldCheck } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import { sessionStore } from '../../../shared/auth/session.store';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { construireNomComplet } from '../models/scolarite.model';
import { useStudentLifecycleStore } from '../stores/student-lifecycle.store';

const store = useStudentLifecycleStore();
const session = sessionStore.state;
const context = activeContextStore.state;
const doctrineAccess = useDoctrineAccess();
const isAuthorized = computed(() => doctrineAccess.canAccessPage('SCO-006'));
const canSuspendStudent = computed(() => doctrineAccess.canUseAction('scolarite.suspensions.write', 'SCO-006'));
const idEleve = ref('');
const versionAttendue = ref(1);
const nomComplet = computed(() =>
  store.state.eleve
    ? construireNomComplet(store.state.eleve.nom, store.state.eleve.postNom, store.state.eleve.prenom)
    : '',
);
const evenementsRecents = computed(() => store.state.evenements.slice(0, 5));
const perimeterMessage = computed(() =>
  session.actorCode === 'DIRECTEUR_DISCIPLINE'
    ? `Suspension strictement bornee a la section ${context.sectionName} de l ecole ${context.schoolName}.`
    : `Suspension bornee au perimetre sectionnel officiel de ${session.actorLabel}.`,
);

watch(() => store.state.eleve?.version, (version) => {
  if (typeof version === 'number') {
    versionAttendue.value = version;
  }
});

async function charger(): Promise<void> {
  if (!idEleve.value.trim()) return;
  await store.charger(idEleve.value.trim());
}

async function suspendre(): Promise<void> {
  if (!idEleve.value.trim()) return;
  await store.executerAction('suspension', idEleve.value.trim(), { versionAttendue: versionAttendue.value });
}
</script>

<style scoped>
.scolarite-callout,.scolarite-kpi-card{border-radius:24px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08)}
.scolarite-callout{display:flex;gap:.75rem;align-items:flex-start;background:linear-gradient(180deg,rgba(243,248,251,.96),rgba(255,255,255,.98))}
.scolarite-grid,.scolarite-kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.scolarite-field{display:grid;gap:.45rem}
.scolarite-field input{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.scolarite-actions{display:flex;flex-wrap:wrap;gap:.75rem}
.scolarite-primary-action,.scolarite-secondary-action{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;font-weight:600}
.scolarite-primary-action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.scolarite-feedback-banner{border-radius:20px;padding:1rem 1.1rem;background:linear-gradient(135deg,#fff5f5,#ffffff);border:1px solid rgba(185,28,28,.18);color:#991b1b;font-weight:600}
.scolarite-timeline{display:grid;gap:.85rem}
.scolarite-timeline__item{border-radius:20px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);display:grid;gap:.25rem}
</style>
