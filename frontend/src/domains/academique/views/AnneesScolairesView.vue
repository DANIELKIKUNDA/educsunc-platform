<template>
  <PageContainer>
    <PageHeader
      eyebrow="ACA-03"
      title="Annees scolaires"
      description="Pilotage local de l annee scolaire: creation, liste, annee active, preparation, garantie, activation, cloture et archivage."
    />

    <AccessBoundary page-code="ACA-LOC-001">
      <ErrorState
        v-if="!isAuthorized"
        title="Acces non autorise"
        message="Cette vue locale academique reste reservee a l administrateur systeme ecole."
      />

      <template v-else>
        <SectionBlock title="Portee" description="Toutes les actions restent bornees a l ecole active.">
          <div class="academique-kpi-grid">
            <div class="academique-kpi-card">
              <small>Acteur</small>
              <strong>{{ session.actorCode }}</strong>
              <span>ACA-03</span>
            </div>
            <div class="academique-kpi-card">
              <small>Ecole</small>
              <strong>{{ context.schoolName }}</strong>
              <span>Scope local</span>
            </div>
            <div class="academique-kpi-card">
              <small>Annee active</small>
              <strong>{{ store.state.active?.code ?? 'Aucune' }}</strong>
              <span>{{ store.state.active?.statut ?? 'A initialiser' }}</span>
            </div>
          </div>
        </SectionBlock>

        <SectionBlock title="Creation et transitions" description="Le frontend suit strictement les routes reelles deja exposees.">
          <div class="academique-form-grid">
            <label class="academique-field">
              <span>Id ecole</span>
              <input v-model="idEcoleInput" type="text" placeholder="uuid-ecole" />
            </label>
            <label class="academique-field">
              <span>Code</span>
              <input v-model="creation.code" type="text" placeholder="2025-2026" />
            </label>
            <label class="academique-field">
              <span>Libelle</span>
              <input v-model="creation.libelle" type="text" placeholder="Annee scolaire 2025-2026" />
            </label>
            <label class="academique-field">
              <span>Date debut</span>
              <input v-model="creation.dateDebut" type="date" />
            </label>
            <label class="academique-field">
              <span>Date fin</span>
              <input v-model="creation.dateFin" type="date" />
            </label>
            <label class="academique-field">
              <span>Utilisateur trace</span>
              <input v-model="traceUtilisateur" type="text" placeholder="uuid-utilisateur" />
            </label>
          </div>
          <div class="academique-actions-row">
            <button class="academique-primary-action" type="button" :disabled="store.state.status === 'loading' || !canCreate" @click="creer">
              Creer
            </button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !idEcoleInput.trim()" @click="chargerListe">
              Lister
            </button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !idEcoleInput.trim()" @click="chargerActive">
              Annee active
            </button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !idEcoleInput.trim() || !traceUtilisateur.trim()" @click="preparer">
              Preparer suivante
            </button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !idEcoleInput.trim() || !traceUtilisateur.trim()" @click="garantir">
              Garantir active
            </button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !idEcoleInput.trim() || !traceUtilisateur.trim()" @click="basculer">
              Basculer
            </button>
          </div>
        </SectionBlock>

        <LoadingState v-if="store.state.status === 'loading'" title="Chargement des annees" message="Lecture ou mutation de l annee scolaire en cours." />
        <ErrorState v-else-if="store.state.status === 'error'" title="Operation impossible" :message="store.state.errorMessage ?? 'Operation academique impossible.'" />

        <SectionBlock
          v-if="store.state.transitionSummary"
          title="Retour de transition"
          description="Le backend retourne un meta explicite pour les operations de preparation, garantie et bascule."
        >
          <pre class="academique-json-preview">{{ JSON.stringify(store.state.transitionSummary, null, 2) }}</pre>
        </SectionBlock>

        <SectionBlock title="Liste des annees" description="La liste reste la base de travail pour activer, cloturer ou archiver.">
          <EmptyState
            v-if="store.state.entries.length === 0"
            title="Aucune annee chargee"
            message="Chargez la liste pour voir les annees scolaires de l ecole."
          />
          <div v-else class="academique-table-shell">
            <table class="academique-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Libelle</th>
                  <th>Statut</th>
                  <th>Periode</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="annee in store.state.entries" :key="annee.id">
                  <td>{{ annee.code }}</td>
                  <td>{{ annee.libelle }}</td>
                  <td>{{ annee.statut }}</td>
                  <td>{{ annee.dateDebut }} -> {{ annee.dateFin }}</td>
                  <td>{{ annee.active ? 'Oui' : 'Non' }}</td>
                  <td>
                    <div class="academique-inline-actions">
                      <button class="academique-link-action" type="button" @click="activer(annee.id)">Activer</button>
                      <button class="academique-link-action" type="button" @click="cloturer(annee.id)">Cloturer</button>
                      <button class="academique-link-action" type="button" @click="archiver(annee.id)">Archiver</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionBlock>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import { sessionStore } from '../../../shared/auth/session.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { tenantContextStore } from '../../../shared/session/tenant-context.store';
import { useAcademicYearsStore } from '../stores/academic-years.store';

const store = useAcademicYearsStore();
const session = sessionStore.state;
const context = activeContextStore.state;
const tenantContext = tenantContextStore.state;
const doctrineAccess = useDoctrineAccess();
const isAuthorized = doctrineAccess.canAccessPage('ACA-LOC-001');
const idEcoleInput = ref(tenantContext.schoolId);
const traceUtilisateur = ref(tenantContext.userId);

const creation = reactive({
  code: '',
  libelle: '',
  dateDebut: '',
  dateFin: '',
});

const canCreate = computed(() =>
  idEcoleInput.value.trim()
  && creation.code.trim()
  && creation.libelle.trim()
  && creation.dateDebut.trim()
  && creation.dateFin.trim()
  && traceUtilisateur.value.trim(),
);

async function chargerListe(): Promise<void> {
  await store.chargerListe(idEcoleInput.value.trim());
}

async function chargerActive(): Promise<void> {
  await store.chargerActive(idEcoleInput.value.trim());
}

async function creer(): Promise<void> {
  await store.creer({
      idEcole: idEcoleInput.value.trim(),
      code: creation.code.trim(),
      libelle: creation.libelle.trim(),
      dateDebut: creation.dateDebut,
      dateFin: creation.dateFin,
      creePar: traceUtilisateur.value.trim(),
  });
}

async function preparer(): Promise<void> {
  await store.preparer({
    idEcole: idEcoleInput.value.trim(),
    creePar: traceUtilisateur.value.trim(),
  });
  await chargerListe();
}

async function garantir(): Promise<void> {
  await store.garantir({
    idEcole: idEcoleInput.value.trim(),
    modifiePar: traceUtilisateur.value.trim(),
  });
  await chargerListe();
}

async function basculer(): Promise<void> {
  await store.basculer({
    idEcole: idEcoleInput.value.trim(),
    modifiePar: traceUtilisateur.value.trim(),
    creerSuivanteSiAbsente: true,
  });
  await chargerListe();
}

async function activer(idAnneeScolaire: string): Promise<void> {
  await store.activer(idAnneeScolaire, traceUtilisateur.value.trim());
  await chargerListe();
  await chargerActive();
}

async function cloturer(idAnneeScolaire: string): Promise<void> {
  await store.cloturer(idAnneeScolaire, traceUtilisateur.value.trim());
  await chargerListe();
}

async function archiver(idAnneeScolaire: string): Promise<void> {
  await store.archiver(idAnneeScolaire, traceUtilisateur.value.trim());
  await chargerListe();
}

void chargerListe();
void chargerActive();
</script>

<style scoped>
.academique-form-grid,.academique-kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.academique-field{display:grid;gap:.45rem}
.academique-field input{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.academique-actions-row,.academique-inline-actions{display:flex;flex-wrap:wrap;gap:.75rem}
.academique-primary-action,.academique-secondary-action,.academique-link-action{border:1px solid rgba(17,40,63,.14);border-radius:999px;padding:.75rem 1rem;font-weight:600}
.academique-primary-action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff}
.academique-secondary-action,.academique-link-action{background:#fff;color:#11283f}
.academique-primary-action:disabled,.academique-secondary-action:disabled{opacity:.55;cursor:not-allowed}
.academique-kpi-card{border-radius:24px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);display:grid;gap:.35rem}
.academique-table-shell{overflow:auto}
.academique-table{width:100%;border-collapse:collapse}
.academique-table th,.academique-table td{padding:.85rem;border-bottom:1px solid rgba(17,40,63,.08);text-align:left;vertical-align:top}
.academique-table th{font-size:.84rem;text-transform:uppercase;color:#5e7385}
.academique-json-preview{margin:0;white-space:pre-wrap;word-break:break-word;padding:1rem;border-radius:20px;background:#102844;color:#edf5fb}
</style>
