<template>
  <PageContainer>
    <PageHeader
      eyebrow="MP-03"
      title="Generation de la proclamation"
      description="Vue d action simple pour generer la proclamation de la classe titulaire."
    />

    <SectionBlock title="Perimetre proclamation" description="Generation reservee au titulaire effectif dans sa bonne classe.">
      <div class="pedagogique-callout">
        <ShieldCheck />
        <p>{{ perimeterMessage }}</p>
      </div>
    </SectionBlock>

    <AccessBoundary capability="module.pedagogique.access">
      <ErrorState
        v-if="!isAuthorized"
        title="Generation non autorisee"
        message="Cette vue reste reservee au titulaire."
      />

      <template v-else>
        <div class="proclamation-generation-kpi-grid">
          <div class="proclamation-generation-kpi-card">
            <small>Acteur</small>
            <strong>{{ session.actorCode }}</strong>
            <span>Titulaire effectif attendu</span>
          </div>
          <div class="proclamation-generation-kpi-card">
            <small>Perimetre</small>
            <strong>{{ scopeLabel }}</strong>
            <span>Classe et annee de travail</span>
          </div>
          <div class="proclamation-generation-kpi-card">
            <small>Prevalidation</small>
            <strong>{{ canGenerate ? 'Prete' : 'Incomplete' }}</strong>
            <span>{{ missingFieldsLabel }}</span>
          </div>
        </div>

        <SectionBlock title="Contexte titulaire" description="La proclamation se lance dans la bonne classe, la bonne annee et sur la bonne colonne de decision.">
          <div class="pedagogique-form-grid">
            <label class="pedagogique-field">
              <span>Annee scolaire</span>
              <input v-model="anneeScolaireLabelInput" type="text" placeholder="2025-2026" />
            </label>
            <label class="pedagogique-field">
              <span>Id annee scolaire</span>
              <input v-model="idAnneeScolaireInput" type="text" placeholder="uuid-annee" />
            </label>
            <label class="pedagogique-field">
              <span>Classe titulaire</span>
              <input v-model="classeLabelInput" type="text" placeholder="4e CG" />
            </label>
            <label class="pedagogique-field">
              <span>Id classe pedagogique</span>
              <input v-model="idClassePedagogiqueInput" type="text" placeholder="uuid-classe" />
            </label>
          </div>
          <div class="pedagogique-actions-row">
            <button class="pedagogique-secondary-action" type="button" @click="synchroniserDepuisRoute">
              Reprendre la route
            </button>
          </div>
        </SectionBlock>

        <SectionBlock title="Parametres de proclamation" description="Le backend reste la source de verite de la colonne cible, du type et des statistiques produites.">
          <div class="pedagogique-form-grid">
            <label class="pedagogique-field">
              <span>Colonne</span>
              <select v-model="codeColonneInput">
                <option v-for="column in columnOptions" :key="column" :value="column">
                  {{ column }}
                </option>
              </select>
            </label>
            <label class="pedagogique-field">
              <span>Type proclamation</span>
              <select v-model="typeProclamationInput">
                <option value="PERIODE">PERIODE</option>
                <option value="EXAMEN">EXAMEN</option>
                <option value="SEMESTRE">SEMESTRE</option>
                <option value="TRIMESTRE">TRIMESTRE</option>
                <option value="ANNUEL">ANNUEL</option>
              </select>
            </label>
          </div>
        </SectionBlock>

        <SectionBlock title="Prevalidation" description="Le frontend controle seulement la presence minimale. Le vrai classement, les non classes et les abandons restent backend.">
          <div class="proclamation-generation-checklist">
            <div :class="['proclamation-generation-check', idAnneeScolaireInput.trim() ? 'is-ready' : 'is-missing']">
              <strong>Annee scolaire</strong>
              <span>{{ idAnneeScolaireInput.trim() ? 'Renseignee' : 'Manquante' }}</span>
            </div>
            <div :class="['proclamation-generation-check', idClassePedagogiqueInput.trim() ? 'is-ready' : 'is-missing']">
              <strong>Classe titulaire</strong>
              <span>{{ idClassePedagogiqueInput.trim() ? 'Renseignee' : 'Manquante' }}</span>
            </div>
            <div :class="['proclamation-generation-check', codeColonneInput.trim() ? 'is-ready' : 'is-missing']">
              <strong>Colonne cible</strong>
              <span>{{ codeColonneInput.trim() ? codeColonneInput : 'Manquante' }}</span>
            </div>
            <div :class="['proclamation-generation-check', typeProclamationInput.trim() ? 'is-ready' : 'is-missing']">
              <strong>Type</strong>
              <span>{{ typeProclamationInput }}</span>
            </div>
          </div>
          <div class="pedagogique-actions-row">
            <button class="pedagogique-primary-action" type="button" :disabled="!canGenerate" @click="generer">
              <FileOutput />
              <span>Generer la proclamation</span>
            </button>
          </div>
        </SectionBlock>

        <LoadingState
          v-if="store.state.status === 'loading'"
          title="Generation de la proclamation"
          message="Le backend consolide les lignes, non classes et abandons."
        />

        <ErrorState
          v-else-if="store.state.status === 'error'"
          title="Generation echouee"
          :message="store.state.errorMessage ?? 'La generation de la proclamation a echoue.'"
        />

        <SectionBlock
          v-else-if="proclamation"
          title="Proclamation generee"
          description="Retour de generation expose directement par le backend."
        >
          <div class="proclamation-generation-kpi-grid">
            <div class="proclamation-generation-kpi-card">
              <small>Proclamation</small>
              <strong>{{ proclamation.idProclamationClasse }}</strong>
              <span>{{ proclamation.typeProclamation }}</span>
            </div>
            <div class="proclamation-generation-kpi-card">
              <small>Classement</small>
              <strong>{{ proclamation.classesCount }}</strong>
              <span>Lignes classees {{ proclamation.lignesCount }}</span>
            </div>
            <div class="proclamation-generation-kpi-card">
              <small>Cas a part</small>
              <strong>{{ proclamation.nonClassesCount }}</strong>
              <span>Abandons {{ proclamation.abandonsCount }}</span>
            </div>
          </div>

          <div class="proclamation-generation-summary">
            <div class="proclamation-generation-summary-card">
              <small>Classe</small>
              <strong>{{ proclamation.idClassePedagogique }}</strong>
              <span>Annee {{ proclamation.idAnneeScolaire }}</span>
            </div>
            <div class="proclamation-generation-summary-card">
              <small>Colonne retenue</small>
              <strong>{{ proclamation.codeColonne }}</strong>
              <span>{{ proclamation.typeProclamation }}</span>
            </div>
          </div>
        </SectionBlock>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { FileOutput, ShieldCheck } from 'lucide-vue-next';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import { sessionStore } from '../../../shared/auth/session.store';
import { authorizedProclamationGenerationActors } from '../models/proclamation-generation.model';
import { useProclamationGenerationStore } from '../stores/proclamation-generation.store';

const route = useRoute();
const router = useRouter();
const store = useProclamationGenerationStore();
const session = sessionStore.state;

const anneeScolaireLabelInput = ref('');
const classeLabelInput = ref('');
const idClassePedagogiqueInput = ref('');
const idAnneeScolaireInput = ref('');
const codeColonneInput = ref('TOTAL_GENERAL');
const typeProclamationInput = ref<'PERIODE' | 'EXAMEN' | 'SEMESTRE' | 'TRIMESTRE' | 'ANNUEL'>('ANNUEL');
const columnOptions = ['P1', 'P2', 'EX1', 'TOTAL_S1', 'P3', 'P4', 'EX2', 'TOTAL_S2', 'TOTAL_GENERAL', 'TOTAL_T1', 'TOTAL_T2', 'P5', 'P6', 'EX3', 'TOTAL_T3'];

const isAuthorized = computed(() => authorizedProclamationGenerationActors.includes(session.actorCode as never));
const proclamation = computed(() => store.state.proclamation);
const perimeterMessage = 'Generation bornee a la classe titulaire effective et a la bonne annee scolaire.';
const missingFields = computed(() => {
  const manquants: string[] = [];

  if (!idAnneeScolaireInput.value.trim()) {
    manquants.push('annee');
  }
  if (!idClassePedagogiqueInput.value.trim()) {
    manquants.push('classe');
  }
  if (!codeColonneInput.value.trim()) {
    manquants.push('colonne');
  }

  return manquants;
});
const canGenerate = computed(() => missingFields.value.length === 0);
const missingFieldsLabel = computed(() =>
  canGenerate.value ? 'Toutes les donnees minimales sont presentes.' : `Manque: ${missingFields.value.join(', ')}`,
);
const scopeLabel = computed(() =>
  [anneeScolaireLabelInput.value.trim(), classeLabelInput.value.trim()].filter(Boolean).join(' / ')
  || [idAnneeScolaireInput.value.trim(), idClassePedagogiqueInput.value.trim()].filter(Boolean).join(' / ')
  || 'Perimetre a renseigner',
);

function lireQueryString(name: string): string {
  const value = route.query[name];
  return typeof value === 'string' ? value : '';
}

function synchroniserDepuisRoute(): void {
  anneeScolaireLabelInput.value = lireQueryString('anneeScolaire');
  classeLabelInput.value = lireQueryString('classe');
  idClassePedagogiqueInput.value = lireQueryString('idClassePedagogique');
  idAnneeScolaireInput.value = lireQueryString('idAnneeScolaire');
  codeColonneInput.value = lireQueryString('codeColonne') || 'TOTAL_GENERAL';
  const type = lireQueryString('typeProclamation');
  typeProclamationInput.value = (type === 'PERIODE' || type === 'EXAMEN' || type === 'SEMESTRE' || type === 'TRIMESTRE' || type === 'ANNUEL')
    ? type
    : 'ANNUEL';
}

async function generer(): Promise<void> {
  if (!isAuthorized.value || !canGenerate.value) {
    return;
  }

  await router.replace({
    query: {
      ...route.query,
      anneeScolaire: anneeScolaireLabelInput.value.trim() || undefined,
      classe: classeLabelInput.value.trim() || undefined,
      idClassePedagogique: idClassePedagogiqueInput.value.trim(),
      idAnneeScolaire: idAnneeScolaireInput.value.trim(),
      codeColonne: codeColonneInput.value,
      typeProclamation: typeProclamationInput.value,
    },
  });

  await store.generer({
    idClassePedagogique: idClassePedagogiqueInput.value.trim(),
    idAnneeScolaire: idAnneeScolaireInput.value.trim(),
    codeColonne: codeColonneInput.value,
    typeProclamation: typeProclamationInput.value,
  });
}

synchroniserDepuisRoute();
</script>

<style scoped>
.pedagogique-callout{display:flex;gap:.75rem;align-items:flex-start;border:1px solid rgba(17,40,63,.08);background:linear-gradient(180deg,rgba(238,246,251,.96),rgba(255,255,255,.98));border-radius:24px;padding:1rem 1.1rem}
.pedagogique-form-grid,.proclamation-generation-kpi-grid,.proclamation-generation-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem}
.pedagogique-field{display:grid;gap:.45rem}
.pedagogique-field input,.pedagogique-field select{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.pedagogique-actions-row{display:flex;flex-wrap:wrap;gap:.75rem}
.pedagogique-primary-action,.pedagogique-secondary-action{border:1px solid rgba(17,40,63,.14);border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;font-weight:600}
.pedagogique-primary-action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff}
.pedagogique-primary-action:disabled{opacity:.55;cursor:not-allowed}
.pedagogique-secondary-action{background:#fff;color:#11283f}
.proclamation-generation-kpi-card,.proclamation-generation-summary-card{border-radius:24px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);display:grid;gap:.35rem}
.proclamation-generation-checklist{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem}
.proclamation-generation-check{border-radius:20px;padding:1rem;border:1px solid rgba(17,40,63,.08);display:grid;gap:.35rem;background:#fff}
.proclamation-generation-check.is-ready{background:linear-gradient(180deg,rgba(237,248,242,.98),rgba(255,255,255,.98));border-color:rgba(45,125,76,.18)}
.proclamation-generation-check.is-missing{background:linear-gradient(180deg,rgba(254,245,239,.98),rgba(255,255,255,.98));border-color:rgba(184,88,37,.15)}
</style>
