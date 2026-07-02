<template>
  <PageContainer>
    <PageHeader eyebrow="MS-05" title="Cycle de vie eleve" description="Lecture du statut courant, de l historique et du bloc d action autorise." />

    <AccessBoundary page-code="SCO-004">
      <ErrorState
        v-if="!isAuthorized"
        title="Cycle de vie non autorise"
        message="La mutation reste borneee aux acteurs prevus et a leur vrai perimetre."
      />

      <template v-else>
        <SectionBlock title="Eleve cible" description="Le backend reste maitre des transitions et de l historisation. L ecran masque maintenant les actions hors couloir metier de l acteur courant.">
          <div class="scolarite-grid">
            <label class="scolarite-field"><span>Id eleve</span><input v-model="idEleve" type="text" placeholder="eleve-uuid" /></label>
            <label class="scolarite-field"><span>Version attendue</span><input v-model.number="versionAttendue" type="number" min="1" /></label>
            <label class="scolarite-field"><span>Action autorisee</span>
              <select v-model="action">
                <option v-for="entry in actionsDisponibles" :key="entry.code" :value="entry.code">
                  {{ entry.label }}
                </option>
              </select>
            </label>
          </div>
          <div class="scolarite-action-policy">
            <article
              v-for="entry in actionsDisponibles"
              :key="entry.code"
              class="scolarite-action-policy__item"
              :class="{ 'scolarite-action-policy__item--active': action === entry.code }"
              @click="action = entry.code"
            >
              <strong>{{ entry.label }}</strong>
              <small>{{ entry.description }}</small>
            </article>
          </div>
          <div class="scolarite-actions">
            <button class="scolarite-primary-action" type="button" @click="charger"><Search /><span>Charger le dossier</span></button>
            <button v-if="canMutateLifecycle" class="scolarite-secondary-action" type="button" @click="executer">Executer l action</button>
          </div>
        </SectionBlock>

        <LoadingState v-if="store.state.status === 'loading'" title="Cycle de vie en cours" message="Lecture de l eleve, du parcours et des evenements en cours." />
        <ErrorState v-else-if="store.state.status === 'error'" title="Cycle de vie indisponible" :message="store.state.errorMessage ?? 'Le dossier ne peut pas etre charge.'" />

        <template v-else-if="store.state.eleve">
          <SectionBlock v-if="store.state.successMessage" title="Derniere mutation" description="Retour immediat du workflow de cycle de vie.">
            <div class="scolarite-feedback-banner">{{ store.state.successMessage }}</div>
          </SectionBlock>

          <div class="scolarite-kpi-grid">
            <div class="scolarite-kpi-card"><small>Eleve</small><strong>{{ nomComplet }}</strong></div>
            <div class="scolarite-kpi-card"><small>Statut</small><strong>{{ store.state.eleve.statutGlobal }}</strong></div>
            <div class="scolarite-kpi-card"><small>Version</small><strong>{{ store.state.eleve.version }}</strong></div>
            <div class="scolarite-kpi-card"><small>Derniere mutation</small><strong>{{ store.state.lastMutation ?? '-' }}</strong></div>
          </div>

          <SectionBlock title="Timeline des evenements" description="L historique est relu depuis le backend, pas reconstruit par le frontend.">
            <div class="scolarite-timeline">
              <article v-for="event in store.state.evenements" :key="event.idEvenementParcours" class="scolarite-timeline__item">
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
import { Search } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import type { CycleVieActionCode } from '../models/scolarite.model';
import {
  construireNomComplet,
  cycleVieActionDescriptions,
  cycleVieDoctrineActionCodes,
  cycleVieActionLabels,
} from '../models/scolarite.model';
import { useStudentLifecycleStore } from '../stores/student-lifecycle.store';

const store = useStudentLifecycleStore();
const doctrineAccess = useDoctrineAccess();
const isAuthorized = computed(() => doctrineAccess.canAccessPage('SCO-004'));
const canMutateLifecycle = computed(() => actionsDisponibles.value.length > 0);
const idEleve = ref('');
const versionAttendue = ref(1);
const actionsDisponibles = computed(() => {
  const visibleActions = doctrineAccess.listVisibleActions('SCO-004');
  return (Object.keys(cycleVieDoctrineActionCodes) as CycleVieActionCode[])
    .filter((code) => visibleActions.some((action) => action.code === cycleVieDoctrineActionCodes[code]))
    .map((code) => ({
      code,
      label: cycleVieActionLabels[code],
      description: cycleVieActionDescriptions[code],
    }));
});
const action = ref<CycleVieActionCode>('abandon');
const nomComplet = computed(() =>
  store.state.eleve
    ? construireNomComplet(store.state.eleve.nom, store.state.eleve.postNom, store.state.eleve.prenom)
    : '',
);

watch(actionsDisponibles, (nouvellesActions) => {
  if (nouvellesActions.length === 0) {
    return;
  }

  if (!nouvellesActions.some((entry) => entry.code === action.value)) {
    action.value = nouvellesActions[0].code;
  }
}, { immediate: true });

watch(() => store.state.eleve?.version, (version) => {
  if (typeof version === 'number') {
    versionAttendue.value = version;
  }
});

async function charger(): Promise<void> {
  if (!idEleve.value.trim()) return;
  await store.charger(idEleve.value.trim());
}

async function executer(): Promise<void> {
  if (!idEleve.value.trim()) return;
  await store.executerAction(action.value, idEleve.value.trim(), { versionAttendue: versionAttendue.value });
}
</script>

<style scoped>
.scolarite-grid,.scolarite-kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.scolarite-field{display:grid;gap:.45rem}
.scolarite-field input,.scolarite-field select{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.scolarite-action-policy{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.85rem}
.scolarite-action-policy__item{border-radius:22px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);display:grid;gap:.35rem;cursor:pointer}
.scolarite-action-policy__item--active{border-color:rgba(11,93,122,.35);background:linear-gradient(135deg,#f0fafc,#ffffff)}
.scolarite-actions{display:flex;flex-wrap:wrap;gap:.75rem}
.scolarite-primary-action,.scolarite-secondary-action{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;font-weight:600}
.scolarite-primary-action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.scolarite-feedback-banner{border-radius:20px;padding:1rem 1.1rem;background:linear-gradient(135deg,#eef8f6,#f7fbf9);border:1px solid rgba(13,114,94,.18);color:#0d5a4b;font-weight:600}
.scolarite-kpi-card,.scolarite-timeline__item{border-radius:24px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08)}
.scolarite-timeline{display:grid;gap:1rem}
</style>
