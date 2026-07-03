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
          <div class="academique-context-strip">
            <div class="academique-context-chip">
              <small>Id ecole actif</small>
              <strong>{{ tenantContext.schoolId }}</strong>
            </div>
            <div class="academique-context-chip">
              <small>Utilisateur trace</small>
              <strong>{{ tenantContext.userId }}</strong>
            </div>
          </div>
          <div class="academique-form-grid">
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
          </div>
          <div class="academique-actions-row">
            <button class="academique-primary-action" type="button" :disabled="store.state.status === 'loading' || !canCreate" @click="creer">
              Creer
            </button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !hasActiveSchool" @click="chargerListe">
              Lister
            </button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !hasActiveSchool" @click="chargerActive">
              Annee active
            </button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !hasMutationContext" @click="preparer">
              Preparer suivante
            </button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !hasMutationContext" @click="garantir">
              Garantir active
            </button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !hasMutationContext" @click="basculer">
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
import { computed, reactive } from 'vue';
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

const creation = reactive({
  code: '',
  libelle: '',
  dateDebut: '',
  dateFin: '',
});

const hasActiveSchool = computed(() => tenantContext.schoolId.trim().length > 0);
const hasMutationContext = computed(() =>
  tenantContext.schoolId.trim().length > 0 && tenantContext.userId.trim().length > 0,
);

const canCreate = computed(() =>
  creation.code.trim()
  && creation.libelle.trim()
  && creation.dateDebut.trim()
  && creation.dateFin.trim()
  && hasMutationContext.value,
);

async function chargerListe(): Promise<void> {
  if (!hasActiveSchool.value) return;
  await store.chargerListe(tenantContext.schoolId.trim());
}

async function chargerActive(): Promise<void> {
  if (!hasActiveSchool.value) return;
  await store.chargerActive(tenantContext.schoolId.trim());
}

async function creer(): Promise<void> {
  if (!hasMutationContext.value) return;
  await store.creer({
      idEcole: tenantContext.schoolId.trim(),
      code: creation.code.trim(),
      libelle: creation.libelle.trim(),
      dateDebut: creation.dateDebut,
      dateFin: creation.dateFin,
      creePar: tenantContext.userId.trim(),
  });
  await chargerListe();
  await chargerActive();
}

async function preparer(): Promise<void> {
  if (!hasMutationContext.value) return;
  await store.preparer({
    idEcole: tenantContext.schoolId.trim(),
    creePar: tenantContext.userId.trim(),
  });
  await chargerListe();
  await chargerActive();
}

async function garantir(): Promise<void> {
  if (!hasMutationContext.value) return;
  await store.garantir({
    idEcole: tenantContext.schoolId.trim(),
    modifiePar: tenantContext.userId.trim(),
  });
  await chargerListe();
  await chargerActive();
}

async function basculer(): Promise<void> {
  if (!hasMutationContext.value) return;
  await store.basculer({
    idEcole: tenantContext.schoolId.trim(),
    modifiePar: tenantContext.userId.trim(),
    creerSuivanteSiAbsente: true,
  });
  await chargerListe();
  await chargerActive();
}

async function activer(idAnneeScolaire: string): Promise<void> {
  if (!tenantContext.userId.trim()) return;
  await store.activer(idAnneeScolaire, tenantContext.userId.trim());
  await chargerListe();
  await chargerActive();
}

async function cloturer(idAnneeScolaire: string): Promise<void> {
  if (!tenantContext.userId.trim()) return;
  await store.cloturer(idAnneeScolaire, tenantContext.userId.trim());
  await chargerListe();
}

async function archiver(idAnneeScolaire: string): Promise<void> {
  if (!tenantContext.userId.trim()) return;
  await store.archiver(idAnneeScolaire, tenantContext.userId.trim());
  await chargerListe();
}

void chargerListe();
void chargerActive();
</script>

<style scoped>
.academique-context-strip,.academique-actions-row,.academique-inline-actions{display:flex;flex-wrap:wrap;gap:.75rem}
.academique-form-grid,.academique-kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.academique-context-chip{border-radius:20px;padding:1rem 1.1rem;background:#f4f8fb;border:1px solid rgba(17,40,63,.08);display:grid;gap:.35rem;min-width:220px}
.academique-field{display:grid;gap:.45rem}
.academique-field input{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
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
