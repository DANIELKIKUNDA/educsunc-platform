<template>
  <PageContainer>
    <PageHeader
      eyebrow="MS-02"
      title="Gestion des eleves"
      description="Vue liste / detail dense et rapide pour consulter les eleves dans le vrai perimetre ecole ou sectionnel."
    >
      <template #actions>
        <div class="scolarite-actions">
          <RouterLink class="scolarite-pill" to="/app/scolarite">
            <ArrowLeft />
            <span>Retour scolarite</span>
          </RouterLink>
          <button class="scolarite-pill" type="button" :disabled="store.state.entries.length === 0" @click="exporterCsv">
            <Sheet />
            <span>Excel</span>
          </button>
          <button class="scolarite-pill scolarite-pill--action" type="button" :disabled="store.state.entries.length === 0" @click="imprimer">
            <Printer />
            <span>Impression</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <SectionBlock title="Perimetre de lecture" description="La consultation reste bornee a l ecole active selon la doctrine effectivement exposee a ce stade.">
      <div class="scolarite-hero">
        <div class="scolarite-hero__lead">
          <div class="scolarite-hero__icon">
            <Users />
          </div>
          <div>
            <h3>{{ perimeterLabel }}</h3>
            <p>{{ perimeterMessage }}</p>
          </div>
        </div>
        <div class="scolarite-badges">
          <PermissionTag :label="session.actorLabel" />
          <ContextBadge label="Organisation" :value="context.organizationName" />
          <ContextBadge label="Ecole" :value="context.schoolName" />
          <ContextBadge label="Section" :value="context.sectionName" />
        </div>
      </div>
    </SectionBlock>

    <AccessBoundary page-code="SCO-002">
      <ErrorState
        v-if="!isAuthorized"
        title="Lecture eleves non autorisee"
        message="Cette vue reste reservee aux acteurs explicitement autorises par la doctrine active."
      />

      <template v-else>
        <SectionBlock title="Chargement et recherche" description="La recherche exploite uniquement les vrais filtres exposes par SCO-06.">
          <div class="scolarite-kpi-grid">
            <div class="scolarite-kpi-card">
              <small>Acteur</small>
              <strong>{{ session.actorLabel }}</strong>
              <span>Lecture ecole complete</span>
            </div>
            <div class="scolarite-kpi-card">
              <small>Resultats visibles</small>
              <strong>{{ store.state.pagination?.total ?? store.state.entries.length }}</strong>
              <span>Total retour backend</span>
            </div>
            <div class="scolarite-kpi-card">
              <small>Page</small>
              <strong>{{ store.state.pagination?.page ?? filters.page }}</strong>
              <span>Taille {{ store.state.pagination?.taillePage ?? filters.taillePage }}</span>
            </div>
            <div class="scolarite-kpi-card">
              <small>Recherche active</small>
              <strong>{{ hasSearch ? 'Oui' : 'Non' }}</strong>
              <span>{{ hasSearch ? 'Endpoint de recherche active' : 'Liste paginee standard' }}</span>
            </div>
          </div>

          <div class="scolarite-form-stack">
            <div class="scolarite-grid">
              <label class="scolarite-field">
                <span>Nom</span>
                <input v-model="filters.nom" type="text" placeholder="Mbuyi" />
              </label>
              <label class="scolarite-field">
                <span>Postnom</span>
                <input v-model="filters.postNom" type="text" placeholder="Kalala" />
              </label>
              <label class="scolarite-field">
                <span>Prenom</span>
                <input v-model="filters.prenom" type="text" placeholder="Sarah" />
              </label>
              <label class="scolarite-field">
                <span>Matricule</span>
                <input v-model="filters.matricule" type="text" placeholder="EL-2026-001" />
              </label>
              <label class="scolarite-field">
                <span>Date de naissance</span>
                <input v-model="filters.dateNaissance" type="date" />
              </label>
              <label class="scolarite-field">
                <span>Page</span>
                <input v-model.number="filters.page" type="number" min="1" />
              </label>
              <label class="scolarite-field">
                <span>Taille page</span>
                <input v-model.number="filters.taillePage" type="number" min="1" />
              </label>
            </div>

            <div class="scolarite-inline-note">
              <ShieldCheck />
              <span>Le backend de cette vue n expose pas encore de filtre classe, section ou statut. Le frontend ne simule donc aucun filtrage absent.</span>
            </div>

            <div class="scolarite-actions-row">
              <button class="scolarite-primary-action" type="button" @click="charger">
                <Search />
                <span>Charger les eleves</span>
              </button>
              <button class="scolarite-secondary-action" type="button" @click="reinitialiserFiltres">
                Reinitialiser
              </button>
            </div>
          </div>
        </SectionBlock>

        <LoadingState
          v-if="store.state.status === 'loading'"
          title="Chargement des eleves"
          message="Lecture du perimetre scolaire en cours."
        />
        <ErrorState
          v-else-if="store.state.status === 'error'"
          title="Eleves indisponibles"
          :message="store.state.errorMessage ?? 'La liste n a pas pu etre ouverte.'"
        />
        <EmptyState
          v-else-if="store.state.entries.length === 0"
          title="Aucun eleve visible"
          message="Ajustez les filtres ou chargez une autre page."
        />

        <template v-else>
          <SectionBlock title="Liste et detail" description="La liste reste l entree principale, avec fiche detail rapide sans quitter la vue.">
            <div class="scolarite-layout">
              <div class="scolarite-table-shell">
                <table class="scolarite-table">
                  <thead>
                    <tr>
                      <th>Matricule</th>
                      <th>Nom complet</th>
                      <th>Sexe</th>
                      <th>Statut</th>
                      <th>Famille</th>
                      <th>Provenance</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="entry in store.state.entries"
                      :key="entry.idEleve"
                      :class="{ 'scolarite-row--selected': store.state.selected?.idEleve === entry.idEleve }"
                    >
                      <td>{{ entry.matricule }}</td>
                      <td>
                        <strong>{{ nomComplet(entry) }}</strong>
                        <div class="scolarite-muted">{{ entry.idEleve }}</div>
                      </td>
                      <td>{{ entry.sexe }}</td>
                      <td>
                        <span class="status-chip" :class="entry.statutGlobal === 'ACTIF' ? 'status-chip--ok' : 'status-chip--neutral'">
                          {{ entry.statutGlobal }}
                        </span>
                      </td>
                      <td>{{ entry.idFamille ?? '-' }}</td>
                      <td>{{ entry.nomEcoleProvenance }}</td>
                      <td>
                        <div class="scolarite-actions-row">
                          <button class="scolarite-inline-action" type="button" @click="ouvrirDetail(entry.idEleve)">Ouvrir</button>
                          <button class="scolarite-inline-action" type="button" @click="ouvrirPaiementEleve(entry.idEleve)">Paiement</button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <aside class="scolarite-panel" v-if="store.state.selected">
                <div class="scolarite-panel__header">
                  <div>
                    <p class="scolarite-label">Eleve</p>
                    <strong>{{ nomComplet(store.state.selected) }}</strong>
                    <div class="scolarite-muted">{{ store.state.selected.idEleve }}</div>
                  </div>
                  <span class="status-chip" :class="store.state.selected.statutGlobal === 'ACTIF' ? 'status-chip--ok' : 'status-chip--neutral'">
                    {{ store.state.selected.statutGlobal }}
                  </span>
                </div>

                <div class="scolarite-detail-grid">
                  <div><small>Matricule</small><strong>{{ store.state.selected.matricule }}</strong></div>
                  <div><small>Date naissance</small><strong>{{ store.state.selected.dateNaissance }}</strong></div>
                  <div><small>Lieu naissance</small><strong>{{ store.state.selected.lieuNaissance ?? '-' }}</strong></div>
                  <div><small>Nationalite</small><strong>{{ store.state.selected.nationalite ?? '-' }}</strong></div>
                  <div><small>Famille</small><strong>{{ store.state.selected.idFamille ?? '-' }}</strong></div>
                  <div><small>Provenance</small><strong>{{ store.state.selected.nomEcoleProvenance }}</strong></div>
                  <div><small>Type provenance</small><strong>{{ store.state.selected.typeProvenance }}</strong></div>
                  <div><small>Version</small><strong>{{ store.state.selected.version }}</strong></div>
                  <div><small>Cree par</small><strong>{{ store.state.selected.creePar }}</strong></div>
                  <div><small>Cree le</small><strong>{{ formatDate(store.state.selected.creeLe) }}</strong></div>
                  <div><small>Modifie par</small><strong>{{ store.state.selected.modifiePar ?? '-' }}</strong></div>
                  <div><small>Modifie le</small><strong>{{ formatDate(store.state.selected.modifieLe) }}</strong></div>
                </div>

                <div class="scolarite-next-grid">
                  <button class="scolarite-next-card" type="button" @click="ouvrirInscriptionDepuisEleve">
                    <strong>Revenir a l inscription</strong>
                    <small>Ouvrir MS-01 avec l eleve deja cible pour poursuivre ou corriger le flux.</small>
                  </button>
                  <button class="scolarite-next-card" type="button" @click="ouvrirPaiementSelection">
                    <strong>Continuer vers le paiement</strong>
                    <small>Passer directement a la perception pour cet eleve.</small>
                  </button>
                </div>
              </aside>
            </div>
          </SectionBlock>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Printer, Search, Sheet, ShieldCheck, Users } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ContextBadge from '../../../shared/ui/ContextBadge.vue';
import PermissionTag from '../../../shared/ui/PermissionTag.vue';
import { sessionStore } from '../../../shared/auth/session.store';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { mapperElevesCsv, mapperNomCompletEleve } from '../mappers/students.mapper';
import { useStudentsStore } from '../stores/students.store';

const store = useStudentsStore();
const session = sessionStore.state;
const context = activeContextStore.state;
const doctrineAccess = useDoctrineAccess();
const route = useRoute();
const router = useRouter();
const isAuthorized = computed(() => doctrineAccess.canAccessPage('SCO-002'));
const filters = reactive({
  nom: '',
  postNom: '',
  prenom: '',
  matricule: '',
  dateNaissance: '',
  page: 1,
  taillePage: 20,
});

const hasSearch = computed(() =>
  Boolean(
    filters.matricule.trim()
    || filters.nom.trim()
    || filters.postNom.trim()
    || filters.prenom.trim()
    || filters.dateNaissance.trim(),
  ),
);

const perimeterLabel = computed(() => `Ecole ${context.schoolName}`);

const perimeterMessage = computed(() =>
  'La lecture exposee ici reste actuellement bornee a l ecole active definie dans le contexte.',
);

function nomComplet(entry: { nom: string; postNom: string; prenom?: string }): string {
  return mapperNomCompletEleve(entry);
}

async function charger(): Promise<void> {
  await store.chargerListe({ ...filters });
}

async function ouvrirDetail(idEleve: string): Promise<void> {
  await store.chargerDetail(idEleve);
}

async function ouvrirPaiementEleve(idEleve: string): Promise<void> {
  await router.push(`/app/finances/paiements/enregistrer?idEleve=${idEleve}`);
}

async function ouvrirPaiementSelection(): Promise<void> {
  if (!store.state.selected) {
    return;
  }

  await ouvrirPaiementEleve(store.state.selected.idEleve);
}

async function ouvrirInscriptionDepuisEleve(): Promise<void> {
  if (!store.state.selected) {
    return;
  }

  const query = new URLSearchParams({ idEleve: store.state.selected.idEleve });
  if (store.state.selected.idFamille) {
    query.set('idFamille', store.state.selected.idFamille);
  }
  await router.push(`/app/scolarite/inscriptions?${query.toString()}`);
}

function reinitialiserFiltres(): void {
  filters.nom = '';
  filters.postNom = '';
  filters.prenom = '';
  filters.matricule = '';
  filters.dateNaissance = '';
  filters.page = 1;
  filters.taillePage = 20;
  store.reinitialiser();
  void charger();
}

function exporterCsv(): void {
  const csv = mapperElevesCsv(store.state.entries);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'eleves.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function imprimer(): void {
  window.print();
}

function formatDate(value?: string): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('fr-FR');
}

onMounted(async () => {
  await charger();

  const idEleve = typeof route.query.idEleve === 'string' ? route.query.idEleve : '';
  if (idEleve) {
    await ouvrirDetail(idEleve);
  }
});
</script>

<style scoped>
.scolarite-actions,.scolarite-actions-row{display:flex;flex-wrap:wrap;gap:.75rem}
.scolarite-pill,.scolarite-primary-action,.scolarite-secondary-action,.scolarite-inline-action{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;font-weight:600;text-decoration:none}
.scolarite-pill--action,.scolarite-primary-action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.scolarite-next-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin-top:1rem}
.scolarite-next-card{display:grid;gap:.55rem;text-align:left;padding:1rem 1.05rem;border-radius:22px;border:1px solid rgba(17,40,63,.08);background:linear-gradient(180deg,#f7fbfd,#ffffff);box-shadow:0 18px 45px rgba(17,40,63,.08);color:#11283f}
.scolarite-next-card small{color:#587083;line-height:1.5}
.scolarite-hero{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap}
.scolarite-hero__lead{display:flex;align-items:center;gap:1rem}
.scolarite-hero__icon{width:56px;height:56px;border-radius:18px;display:grid;place-items:center;background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff}
.scolarite-badges{display:flex;flex-wrap:wrap;gap:.75rem;align-items:flex-start}
.scolarite-form-stack{display:grid;gap:1rem}
.scolarite-grid,.scolarite-kpi-grid,.scolarite-detail-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem}
.scolarite-field{display:grid;gap:.45rem}
.scolarite-field input{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.scolarite-kpi-card,.scolarite-panel{border-radius:24px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08)}
.scolarite-inline-note{display:flex;gap:.75rem;align-items:flex-start;border-radius:18px;background:#f7fbfd;padding:.9rem 1rem;color:#456175}
.scolarite-layout{display:grid;grid-template-columns:minmax(0,2fr) minmax(320px,1fr);gap:1rem}
.scolarite-table-shell{overflow:auto;border-radius:22px;border:1px solid rgba(17,40,63,.08);background:#fff}
.scolarite-table{width:100%;border-collapse:collapse;min-width:900px}
.scolarite-table th,.scolarite-table td{padding:.9rem 1rem;border-bottom:1px solid rgba(17,40,63,.08);text-align:left;vertical-align:top}
.scolarite-table th{background:#edf4f8;font-size:.85rem;letter-spacing:.03em;text-transform:uppercase}
.scolarite-row--selected{background:#f7fbfd}
.scolarite-panel{display:grid;gap:1rem}
.scolarite-panel__header{display:flex;justify-content:space-between;gap:.75rem;align-items:flex-start}
.scolarite-label{margin:0 0 .2rem;color:#4f6677;font-size:.83rem;text-transform:uppercase;letter-spacing:.08em}
.scolarite-muted{color:#5d7385;font-size:.82rem}
.status-chip{display:inline-flex;align-items:center;border-radius:999px;padding:.2rem .65rem;font-size:.82rem;font-weight:600}
.status-chip--ok{background:#e7f6ee;color:#166534}
.status-chip--neutral{background:#edf4f8;color:#365066}
@media (max-width:1080px){.scolarite-layout{grid-template-columns:1fr}.scolarite-hero{flex-direction:column}.scolarite-hero__lead{align-items:flex-start}}
</style>
