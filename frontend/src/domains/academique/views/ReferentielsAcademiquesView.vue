<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-ACA-001"
      title="Referentiels academiques"
      description="Lecture plateforme du socle officiel, des classes academiques et des referentiels programmes."
    />

    <SectionBlock title="Perimetre" description="Lecture reservee a la gouvernance plateforme.">
      <div class="academique-kpi-grid">
        <div class="academique-kpi-card">
          <small>Acteur</small>
          <strong>{{ session.actorCode }}</strong>
          <span>Lecture academique officielle</span>
        </div>
        <div class="academique-kpi-card">
          <small>Permission</small>
          <strong>referentiel.read</strong>
          <span>Plateforme uniquement</span>
        </div>
        <div class="academique-kpi-card">
          <small>Etat</small>
          <strong>{{ isAuthorized ? 'Autorise' : 'Non autorise' }}</strong>
          <span>{{ isAuthorized ? 'MANAGER_SYSTEME ou OPERATEUR_SYSTEME' : 'SUPPORT_SYSTEME exclu' }}</span>
        </div>
      </div>
    </SectionBlock>

    <AccessBoundary :page-code="currentPageCode">
      <ErrorState
        v-if="!isAuthorized"
        title="Lecture non autorisee"
        message="Cette lecture academique reste reservee au pilotage plateforme."
      />

      <template v-else>
        <SectionBlock title="Filtres et contexte" description="Le detail d un referentiel se charge depuis son identifiant reel.">
          <div class="academique-form-grid">
            <label class="academique-field">
              <span>Id classe academique</span>
              <input v-model="idClasseAcademiqueInput" type="text" placeholder="uuid-classe-academique" />
            </label>
            <label class="academique-field">
              <span>Id referentiel programme</span>
              <input v-model="idReferentielProgrammeInput" type="text" placeholder="uuid-referentiel-programme" />
            </label>
          </div>
          <div class="academique-actions-row">
            <button class="academique-primary-action" type="button" @click="chargerSocle">
              Charger le socle
            </button>
            <button class="academique-secondary-action" type="button" :disabled="!idClasseAcademiqueInput.trim()" @click="chargerReferentiels">
              Charger les referentiels
            </button>
            <button class="academique-secondary-action" type="button" :disabled="!idReferentielProgrammeInput.trim()" @click="chargerDetail">
              Ouvrir le detail
            </button>
          </div>
        </SectionBlock>

        <LoadingState
          v-if="store.state.status === 'loading'"
          title="Chargement academique"
          message="Lecture des structures et referentiels officiels en cours."
        />
        <ErrorState
          v-else-if="store.state.status === 'error'"
          title="Lecture academique indisponible"
          :message="store.state.errorMessage ?? 'La lecture academique a echoue.'"
        />

        <template v-else>
          <div class="academique-kpi-grid">
            <div class="academique-kpi-card">
              <small>Sections</small>
              <strong>{{ store.state.sections.length }}</strong>
              <span>Socle academique</span>
            </div>
            <div class="academique-kpi-card">
              <small>Classes academiques</small>
              <strong>{{ store.state.classesAcademiques.length }}</strong>
              <span>Liste officielle</span>
            </div>
            <div class="academique-kpi-card">
              <small>Options</small>
              <strong>{{ store.state.optionsEtudes.length }}</strong>
              <span>Options d etude</span>
            </div>
            <div class="academique-kpi-card">
              <small>Referentiels listes</small>
              <strong>{{ store.state.referentiels.length }}</strong>
              <span>Filtres par classe academique</span>
            </div>
          </div>

          <SectionBlock title="Socle academique officiel" description="Les structures de base restent visibles dans le meme ecran pilote.">
            <div class="academique-three-columns">
              <div class="academique-panel">
                <h3>Sections scolaires</h3>
                <ul class="academique-inline-list">
                  <li v-for="section in store.state.sections" :key="section.id">
                    <strong>{{ section.code }}</strong>
                    <span>{{ section.libelle }}</span>
                  </li>
                </ul>
              </div>
              <div class="academique-panel">
                <h3>Classes academiques</h3>
                <ul class="academique-inline-list">
                  <li v-for="classe in store.state.classesAcademiques.slice(0, 12)" :key="classe.id">
                    <strong>{{ classe.code }}</strong>
                    <span>{{ classe.libelle }}</span>
                  </li>
                </ul>
              </div>
              <div class="academique-panel">
                <h3>Options d etude</h3>
                <ul class="academique-inline-list">
                  <li v-for="option in store.state.optionsEtudes" :key="option.id">
                    <strong>{{ option.abreviation ?? option.code }}</strong>
                    <span>{{ option.libelle }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock title="Referentiels programmes" description="Chaque ligne peut ouvrir le detail officiel du referentiel.">
            <EmptyState
              v-if="store.state.referentiels.length === 0"
              title="Aucun referentiel charge"
              message="Renseignez un id de classe academique pour lister ses referentiels programmes."
            />
            <div v-else class="academique-table-shell">
              <table class="academique-table">
                <thead>
                  <tr>
                    <th>Referentiel</th>
                    <th>Classe academique</th>
                    <th>Structure</th>
                    <th>Actif</th>
                    <th>Version projetee</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="referentiel in store.state.referentiels" :key="referentiel.id">
                    <td>{{ referentiel.id }}</td>
                    <td>{{ referentiel.idClasseAcademique }}</td>
                    <td>{{ referentiel.typeStructureEvaluation }}</td>
                    <td>{{ referentiel.actif ? 'Oui' : 'Non' }}</td>
                    <td>{{ referentiel.versionProjectionnee?.codeVersion ?? 'Aucune' }}</td>
                    <td>
                      <button class="academique-link-action" type="button" @click="ouvrirDetail(referentiel.id)">
                        Detail
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionBlock>

          <SectionBlock
            v-if="store.state.detailReferentiel"
            title="Detail du referentiel"
            description="Projection backend directe avec version et nombre de lignes officielles."
          >
            <div class="academique-kpi-grid">
              <div class="academique-kpi-card">
                <small>Referentiel</small>
                <strong>{{ store.state.detailReferentiel.id }}</strong>
                <span>Classe {{ store.state.detailReferentiel.idClasseAcademique }}</span>
              </div>
              <div class="academique-kpi-card">
                <small>Version projetee</small>
                <strong>{{ store.state.detailReferentiel.versionProjectionnee?.codeVersion ?? 'Aucune' }}</strong>
                <span>{{ store.state.detailReferentiel.versionProjectionnee?.anneeReference ?? 'Sans annee' }}</span>
              </div>
              <div class="academique-kpi-card">
                <small>Lignes</small>
                <strong>{{ store.state.detailReferentiel.versionProjectionnee?.lignes.length ?? 0 }}</strong>
                <span>Programme officiel</span>
              </div>
            </div>
          </SectionBlock>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import { sessionStore } from '../../../shared/auth/session.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { useAcademiqueReferentielsStore } from '../stores/referentiels.store';

const store = useAcademiqueReferentielsStore();
const session = sessionStore.state;
const doctrineAccess = useDoctrineAccess();
const currentPageCode = computed(() => {
  const code = doctrineAccess.currentPage.value?.code;
  return typeof code === 'string' ? code : undefined;
});
const isAuthorized = computed(() => currentPageCode.value ? doctrineAccess.canAccessPage(currentPageCode.value) : false);

const idClasseAcademiqueInput = ref('');
const idReferentielProgrammeInput = ref('');

async function chargerSocle(): Promise<void> {
  await store.chargerSocle();
}

async function chargerReferentiels(): Promise<void> {
  await store.chargerReferentiels(idClasseAcademiqueInput.value.trim());
}

async function chargerDetail(): Promise<void> {
  await store.chargerDetail(idReferentielProgrammeInput.value.trim());
}

function ouvrirDetail(idReferentiel: string): void {
  idReferentielProgrammeInput.value = idReferentiel;
  void chargerDetail();
}

void chargerSocle();
</script>

<style scoped>
.academique-form-grid,.academique-kpi-grid,.academique-three-columns{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.academique-field{display:grid;gap:.45rem}
.academique-field input{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.academique-actions-row{display:flex;flex-wrap:wrap;gap:.75rem}
.academique-primary-action,.academique-secondary-action,.academique-link-action{border:1px solid rgba(17,40,63,.14);border-radius:999px;padding:.75rem 1rem;background:#fff;color:#11283f;font-weight:600}
.academique-primary-action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff}
.academique-kpi-card,.academique-panel{border-radius:24px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);display:grid;gap:.35rem}
.academique-inline-list{list-style:none;padding:0;margin:0;display:grid;gap:.7rem}
.academique-inline-list li{display:grid;gap:.2rem;padding-bottom:.6rem;border-bottom:1px solid rgba(17,40,63,.08)}
.academique-table-shell{overflow:auto}
.academique-table{width:100%;border-collapse:collapse}
.academique-table th,.academique-table td{padding:.85rem;border-bottom:1px solid rgba(17,40,63,.08);text-align:left;vertical-align:top}
.academique-table th{font-size:.84rem;text-transform:uppercase;color:#5e7385}
</style>
