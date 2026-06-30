<template>
  <PageContainer>
    <PageHeader eyebrow="ACA-06" title="Calendrier academique" description="Creation, consultation, ajustement, validation et verrouillage du calendrier academique local." />
    <AccessBoundary capability="module.academique.access">
      <ErrorState v-if="!isAuthorized" title="Acces non autorise" message="Cette vue locale academique reste reservee a l administrateur systeme ecole." />
      <template v-else>
        <SectionBlock title="Calendrier cible" description="Le backend porte la vraie logique de calendrier et de ses periodes.">
          <div class="academique-form-grid">
            <label class="academique-field"><span>Id ecole</span><input v-model="idEcoleInput" type="text" /></label>
            <label class="academique-field"><span>Id annee scolaire</span><input v-model="idAnneeScolaireInput" type="text" /></label>
            <label class="academique-field"><span>Type structure evaluation</span><input v-model="typeStructureEvaluationInput" type="text" placeholder="SECONDAIRE_TRIMESTRIEL" /></label>
            <label class="academique-field"><span>Date debut annee</span><input v-model="dateDebutAnneeInput" type="date" /></label>
            <label class="academique-field"><span>Date fin annee</span><input v-model="dateFinAnneeInput" type="date" /></label>
            <label class="academique-field"><span>Utilisateur trace</span><input v-model="traceUtilisateur" type="text" /></label>
          </div>
          <div class="academique-actions-row">
            <button class="academique-primary-action" type="button" :disabled="store.state.status === 'loading' || !canCreate" @click="creer">Creer</button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !idEcoleInput.trim() || !idAnneeScolaireInput.trim()" @click="consulterParEcoleEtAnnee">Consulter par ecole/annee</button>
          </div>
        </SectionBlock>

        <SectionBlock title="Periode pilote" description="Le patch de periode se fait par code documentaire de periode.">
          <div class="academique-form-grid">
            <label class="academique-field"><span>Id calendrier</span><input v-model="idCalendrierInput" type="text" /></label>
            <label class="academique-field"><span>Code periode</span><input v-model="periode.code" type="text" placeholder="P1" /></label>
            <label class="academique-field"><span>Libelle</span><input v-model="periode.libelle" type="text" /></label>
            <label class="academique-field"><span>Ordre</span><input v-model="periode.ordre" type="number" min="1" /></label>
            <label class="academique-field"><span>Type periode</span><input v-model="periode.typePeriode" type="text" placeholder="PERIODE" /></label>
            <label class="academique-field"><span>Date debut</span><input v-model="periode.dateDebut" type="date" /></label>
            <label class="academique-field"><span>Date fin</span><input v-model="periode.dateFin" type="date" /></label>
          </div>
          <div class="academique-actions-row">
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !canPatchPeriode" @click="modifierPeriode">Modifier periode</button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !idCalendrierInput.trim() || !traceUtilisateur.trim()" @click="valider">Valider</button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !idCalendrierInput.trim() || !traceUtilisateur.trim()" @click="verrouiller">Verrouiller</button>
          </div>
        </SectionBlock>

        <LoadingState v-if="store.state.status === 'loading'" title="Calendrier academique" message="Lecture ou mutation du calendrier academique local en cours." />
        <ErrorState v-else-if="store.state.status === 'error'" title="Operation impossible" :message="store.state.errorMessage ?? 'Operation impossible.'" />
        <SectionBlock v-else-if="store.state.calendrier" title="Calendrier charge" description="La projection backend reste la source de verite du calendrier local.">
          <pre class="academique-json-preview">{{ JSON.stringify(store.state.calendrier, null, 2) }}</pre>
        </SectionBlock>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import { sessionStore } from '../../../shared/auth/session.store';
import { tenantContextStore } from '../../../shared/session/tenant-context.store';
import { authorizedAcademiqueLocalActors } from '../models/academique.model';
import { useCalendrierAcademiqueStore } from '../stores/calendrier-academique.store';

const store = useCalendrierAcademiqueStore();
const session = sessionStore.state;
const tenantContext = tenantContextStore.state;
const isAuthorized = authorizedAcademiqueLocalActors.includes(session.actorCode as never);
const idEcoleInput = ref(tenantContext.schoolId);
const idAnneeScolaireInput = ref('');
const typeStructureEvaluationInput = ref('');
const dateDebutAnneeInput = ref('');
const dateFinAnneeInput = ref('');
const traceUtilisateur = ref(tenantContext.userId);
const idCalendrierInput = ref('');

const periode = reactive({
  code: '',
  libelle: '',
  ordre: '1',
  typePeriode: '',
  dateDebut: '',
  dateFin: '',
});

const canCreate = computed(() =>
  idEcoleInput.value.trim()
  && idAnneeScolaireInput.value.trim()
  && typeStructureEvaluationInput.value.trim()
  && dateDebutAnneeInput.value.trim()
  && dateFinAnneeInput.value.trim()
  && traceUtilisateur.value.trim(),
);
const canPatchPeriode = computed(() =>
  idCalendrierInput.value.trim()
  && periode.code.trim()
  && periode.libelle.trim()
  && periode.ordre.trim()
  && periode.typePeriode.trim()
  && periode.dateDebut.trim()
  && periode.dateFin.trim()
  && traceUtilisateur.value.trim(),
);

async function creer(): Promise<void> {
  await store.creer({
      idEcole: idEcoleInput.value.trim(),
      idAnneeScolaire: idAnneeScolaireInput.value.trim(),
      typeStructureEvaluation: typeStructureEvaluationInput.value.trim(),
      dateDebutAnnee: dateDebutAnneeInput.value,
      dateFinAnnee: dateFinAnneeInput.value,
      periodes: [{
        code: periode.code.trim() || 'P1',
        libelle: periode.libelle.trim() || 'Periode 1',
        ordre: Number.parseInt(periode.ordre, 10),
        typePeriode: periode.typePeriode.trim() || 'PERIODE',
        dateDebut: periode.dateDebut || dateDebutAnneeInput.value,
        dateFin: periode.dateFin || dateFinAnneeInput.value,
      }],
      creePar: traceUtilisateur.value.trim(),
  });
  idCalendrierInput.value = store.state.calendrier?.id ?? '';
}

async function consulterParEcoleEtAnnee(): Promise<void> {
  await store.consulterParEcoleEtAnnee(idEcoleInput.value.trim(), idAnneeScolaireInput.value.trim());
  idCalendrierInput.value = store.state.calendrier?.id ?? '';
}

async function modifierPeriode(): Promise<void> {
  await store.modifierPeriode(
      idCalendrierInput.value.trim(),
      periode.code.trim(),
      {
        code: periode.code.trim(),
        libelle: periode.libelle.trim(),
        ordre: Number.parseInt(periode.ordre, 10),
        typePeriode: periode.typePeriode.trim(),
        dateDebut: periode.dateDebut,
        dateFin: periode.dateFin,
        modifiePar: traceUtilisateur.value.trim(),
      },
    );
}

async function valider(): Promise<void> {
  await store.valider(idCalendrierInput.value.trim(), traceUtilisateur.value.trim());
}

async function verrouiller(): Promise<void> {
  await store.verrouiller(idCalendrierInput.value.trim(), traceUtilisateur.value.trim());
}
</script>

<style scoped>
.academique-form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.academique-field{display:grid;gap:.45rem}
.academique-field input{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.academique-actions-row{display:flex;flex-wrap:wrap;gap:.75rem}
.academique-primary-action,.academique-secondary-action{border:1px solid rgba(17,40,63,.14);border-radius:999px;padding:.75rem 1rem;font-weight:600}
.academique-primary-action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff}
.academique-secondary-action{background:#fff;color:#11283f}
.academique-primary-action:disabled,.academique-secondary-action:disabled{opacity:.55;cursor:not-allowed}
.academique-json-preview{margin:0;white-space:pre-wrap;word-break:break-word;padding:1rem;border-radius:20px;background:#102844;color:#edf5fb}
</style>
