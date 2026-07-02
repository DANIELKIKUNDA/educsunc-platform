<template>
  <PageContainer>
    <PageHeader
      eyebrow="MP-02"
      title="Generation du bulletin"
      description="Vue d action breve et controlee pour generer un bulletin dans le bon perimetre."
    />

    <SectionBlock title="Perimetre bulletin" description="Generation reservee au titulaire effectif, dans sa classe et sa bonne annee scolaire.">
      <div class="pedagogique-callout">
        <ShieldCheck />
        <p>{{ perimeterMessage }}</p>
      </div>
    </SectionBlock>

    <AccessBoundary page-code="PED-002">
      <ErrorState
        v-if="!isAuthorized"
        title="Generation non autorisee"
        message="Cette vue reste reservee au titulaire."
      />

      <template v-else>
        <div class="bulletin-generation-kpi-grid">
          <div class="bulletin-generation-kpi-card">
            <small>Acteur</small>
            <strong>{{ session.actorCode }}</strong>
            <span>Titulaire effectif attendu</span>
          </div>
          <div class="bulletin-generation-kpi-card">
            <small>Perimetre</small>
            <strong>{{ scopeLabel }}</strong>
            <span>Classe et annee de travail</span>
          </div>
          <div class="bulletin-generation-kpi-card">
            <small>Precontrole</small>
            <strong>{{ canGenerate ? 'Pret' : 'Incomplet' }}</strong>
            <span>{{ missingFieldsLabel }}</span>
          </div>
        </div>

        <SectionBlock title="Contexte titulaire" description="La vue reste pilotee par la classe, l annee et l eleve deja connu dans la bonne inscription.">
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

        <SectionBlock title="Cible bulletin" description="Le backend genere encore un bulletin eleve par eleve, sur une inscription precise.">
          <div class="pedagogique-form-grid">
            <label class="pedagogique-field">
              <span>Id eleve</span>
              <input v-model="idEleveInput" type="text" placeholder="uuid-eleve" />
            </label>
            <label class="pedagogique-field">
              <span>Id inscription scolaire</span>
              <input v-model="idInscriptionInput" type="text" placeholder="uuid-inscription" />
            </label>
            <label class="pedagogique-field">
              <span>Type de generation</span>
              <select v-model="typeGenerationInput">
                <option value="BROUILLON">BROUILLON</option>
                <option value="PROGRESSIF">PROGRESSIF</option>
                <option value="FINALISATION">FINALISATION</option>
              </select>
            </label>
            <label class="pedagogique-field">
              <span>Version bulletin</span>
              <input v-model="versionBulletinInput" type="number" min="1" placeholder="1" />
            </label>
            <label class="pedagogique-field pedagogique-field--checkbox">
              <input v-model="preparerPdfInput" type="checkbox" />
              <span>Preparer le PDF</span>
            </label>
          </div>
        </SectionBlock>

        <SectionBlock title="Precontrole" description="Le frontend ne valide que la presence minimale. Le vrai verrou de coherence reste backend.">
          <div class="bulletin-generation-checklist">
            <div :class="['bulletin-generation-check', idAnneeScolaireInput.trim() ? 'is-ready' : 'is-missing']">
              <strong>Annee scolaire</strong>
              <span>{{ idAnneeScolaireInput.trim() ? 'Renseignee' : 'Manquante' }}</span>
            </div>
            <div :class="['bulletin-generation-check', idClassePedagogiqueInput.trim() ? 'is-ready' : 'is-missing']">
              <strong>Classe titulaire</strong>
              <span>{{ idClassePedagogiqueInput.trim() ? 'Renseignee' : 'Manquante' }}</span>
            </div>
            <div :class="['bulletin-generation-check', idEleveInput.trim() ? 'is-ready' : 'is-missing']">
              <strong>Eleve</strong>
              <span>{{ idEleveInput.trim() ? 'Renseigne' : 'Manquant' }}</span>
            </div>
            <div :class="['bulletin-generation-check', idInscriptionInput.trim() ? 'is-ready' : 'is-missing']">
              <strong>Inscription scolaire</strong>
              <span>{{ idInscriptionInput.trim() ? 'Renseignee' : 'Manquante' }}</span>
            </div>
          </div>
          <div class="pedagogique-actions-row">
            <button
              v-if="canGenerateBulletin"
              class="pedagogique-primary-action"
              type="button"
              :disabled="!canGenerate"
              @click="generer"
            >
              <FileOutput />
              <span>Generer le bulletin</span>
            </button>
          </div>
        </SectionBlock>

        <LoadingState
          v-if="store.state.status === 'loading'"
          title="Generation du bulletin"
          message="Le backend consolide le bulletin demande."
        />

        <ErrorState
          v-else-if="store.state.status === 'error'"
          title="Generation echouee"
          :message="store.state.errorMessage ?? 'La generation du bulletin a echoue.'"
        />

        <SectionBlock
          v-else-if="bulletin"
          title="Bulletin genere"
          description="Retour de generation expose directement par le backend."
        >
          <div class="bulletin-generation-kpi-grid">
            <div class="bulletin-generation-kpi-card">
              <small>Bulletin</small>
              <strong>{{ bulletin.idBulletinEleve }}</strong>
              <span>Version {{ bulletin.versionBulletin }}</span>
            </div>
            <div class="bulletin-generation-kpi-card">
              <small>Etat</small>
              <strong>{{ bulletin.etatBulletin }}</strong>
              <span>{{ bulletin.typeStructureEvaluation }}</span>
            </div>
            <div class="bulletin-generation-kpi-card">
              <small>Structure</small>
              <strong>{{ bulletin.lignesCount }} lignes</strong>
              <span>Blocs conduite {{ bulletin.blocsCount }}</span>
            </div>
          </div>

          <div class="bulletin-generation-summary">
            <div class="bulletin-generation-summary-card">
              <small>Eleve</small>
              <strong>{{ bulletin.idEleve }}</strong>
              <span>Inscription {{ bulletin.idInscriptionScolaire }}</span>
            </div>
            <div class="bulletin-generation-summary-card">
              <small>Classe</small>
              <strong>{{ bulletin.idClassePedagogique }}</strong>
              <span>Annee {{ bulletin.idAnneeScolaire }}</span>
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
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { useBulletinGenerationStore } from '../stores/bulletin-generation.store';

const route = useRoute();
const router = useRouter();
const store = useBulletinGenerationStore();
const session = sessionStore.state;
const doctrineAccess = useDoctrineAccess();

const anneeScolaireLabelInput = ref('');
const classeLabelInput = ref('');
const idClassePedagogiqueInput = ref('');
const idEleveInput = ref('');
const idInscriptionInput = ref('');
const idAnneeScolaireInput = ref('');
const typeGenerationInput = ref<'BROUILLON' | 'PROGRESSIF' | 'FINALISATION'>('PROGRESSIF');
const versionBulletinInput = ref('');
const preparerPdfInput = ref(false);

const isAuthorized = computed(() => doctrineAccess.canAccessPage('PED-002'));
const canGenerateBulletin = computed(() => doctrineAccess.canUseAction('pedagogique.bulletins.generate', 'PED-002'));
const bulletin = computed(() => store.state.bulletin);
const perimeterMessage = 'Generation bornee a la classe titulaire effective et a la bonne annee scolaire.';
const missingFields = computed(() => {
  const manquants: string[] = [];

  if (!idAnneeScolaireInput.value.trim()) {
    manquants.push('annee');
  }
  if (!idClassePedagogiqueInput.value.trim()) {
    manquants.push('classe');
  }
  if (!idEleveInput.value.trim()) {
    manquants.push('eleve');
  }
  if (!idInscriptionInput.value.trim()) {
    manquants.push('inscription');
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
  idEleveInput.value = lireQueryString('idEleve');
  idInscriptionInput.value = lireQueryString('idInscriptionScolaire');
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
      idClassePedagogique: idClassePedagogiqueInput.value.trim() || undefined,
      idAnneeScolaire: idAnneeScolaireInput.value.trim(),
      idEleve: idEleveInput.value.trim(),
      idInscriptionScolaire: idInscriptionInput.value.trim(),
    },
  });

  await store.generer({
    idEleve: idEleveInput.value.trim(),
    idInscriptionScolaire: idInscriptionInput.value.trim(),
    idAnneeScolaire: idAnneeScolaireInput.value.trim(),
    typeGeneration: typeGenerationInput.value,
    versionBulletin: versionBulletinInput.value.trim() ? Number.parseInt(versionBulletinInput.value, 10) : undefined,
    preparerPdf: preparerPdfInput.value,
  });
}

synchroniserDepuisRoute();
</script>

<style scoped>
.pedagogique-callout{display:flex;gap:.75rem;align-items:flex-start;border:1px solid rgba(17,40,63,.08);background:linear-gradient(180deg,rgba(238,246,251,.96),rgba(255,255,255,.98));border-radius:24px;padding:1rem 1.1rem}
.pedagogique-form-grid,.bulletin-generation-kpi-grid,.bulletin-generation-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem}
.pedagogique-field{display:grid;gap:.45rem}
.pedagogique-field input,.pedagogique-field select{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.pedagogique-field--checkbox{display:flex;align-items:center;gap:.7rem}
.pedagogique-actions-row{display:flex;flex-wrap:wrap;gap:.75rem}
.pedagogique-primary-action,.pedagogique-secondary-action{border:1px solid rgba(17,40,63,.14);border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;font-weight:600}
.pedagogique-primary-action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff}
.pedagogique-primary-action:disabled{opacity:.55;cursor:not-allowed}
.pedagogique-secondary-action{background:#fff;color:#11283f}
.bulletin-generation-kpi-card,.bulletin-generation-summary-card{border-radius:24px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);display:grid;gap:.35rem}
.bulletin-generation-checklist{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem}
.bulletin-generation-check{border-radius:20px;padding:1rem;border:1px solid rgba(17,40,63,.08);display:grid;gap:.35rem;background:#fff}
.bulletin-generation-check.is-ready{background:linear-gradient(180deg,rgba(237,248,242,.98),rgba(255,255,255,.98));border-color:rgba(45,125,76,.18)}
.bulletin-generation-check.is-missing{background:linear-gradient(180deg,rgba(254,245,239,.98),rgba(255,255,255,.98));border-color:rgba(184,88,37,.15)}
</style>
