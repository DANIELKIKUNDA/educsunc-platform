<template>
  <PageContainer>
    <PageHeader
      eyebrow="Organisation"
      title="Ecoles rattachees"
      :description="organisation
        ? `Ecoles reliees a ${organisation.nom}.`
        : 'Lecture des ecoles appartenant a l organisation selectionnee.'"
    >
      <template #actions>
        <div class="org-schools__actions">
          <button class="org-schools__button org-schools__button--ghost" type="button" @click="revenirOrganisation">
            <ArrowLeft :size="16" />
            <span>Retour a l organisation</span>
          </button>
          <button class="org-schools__button org-schools__button--ghost" type="button" @click="revenirRegistre">
            <Undo2 :size="16" />
            <span>Retour au registre</span>
          </button>
          <button v-if="canCreateSchool" class="org-schools__button org-schools__button--primary" type="button" @click="creerEcole">
            <Plus :size="16" />
            <span>Creer une ecole</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <OrganizationAttachedSchoolsSkeleton v-if="isLoading" />
    <ErrorState
      v-else-if="errorMessage && filteredSchools.length === 0"
      title="Ecoles indisponibles"
      :message="errorMessage"
    />
    <template v-else>
      <section class="org-schools__hero">
        <div>
          <small>{{ organisation?.code || 'Code non renseigne' }}</small>
          <h2>{{ organisation?.nom || 'Organisation non renseignee' }}</h2>
          <p>Cette page affiche uniquement les ecoles rattachees a l organisation selectionnee, avec un chargement progressif et sans pagination numerotee.</p>
          <div class="org-schools__hero-meta">
            <span>Organisation</span>
            <strong>{{ organisation?.code || 'Non renseigné' }}</strong>
            <span>Version</span>
            <strong>v{{ organisation?.version ?? '0' }}</strong>
          </div>
        </div>
        <span :class="['org-schools__status', organisation?.actif ? 'is-active' : 'is-inactive']">
          {{ organisation?.actif ? 'Active' : 'Inactive' }}
        </span>
      </section>

      <section class="org-schools__stats">
        <article class="org-schools__stat-card">
          <Building2 :size="20" />
          <strong>{{ stats.total }}</strong>
          <span>Total ecoles</span>
        </article>
        <article class="org-schools__stat-card">
          <CircleCheckBig :size="20" />
          <strong>{{ stats.active }}</strong>
          <span>Ecoles actives</span>
        </article>
        <article class="org-schools__stat-card">
          <CircleSlash :size="20" />
          <strong>{{ stats.inactive }}</strong>
          <span>Ecoles inactives</span>
        </article>
        <article class="org-schools__stat-card">
          <Boxes :size="20" />
          <strong>{{ stats.modules }}</strong>
          <span>Modules actives</span>
        </article>
      </section>

      <SectionBlock title="Recherche et filtres" description="Filtrez les ecoles deja chargees sans quitter la page.">
        <div class="org-schools__filters">
          <label class="org-schools__field org-schools__field--search">
            <Search :size="16" />
            <input v-model="searchTerm" type="search" placeholder="Rechercher par code ou nom d ecole" />
          </label>

          <label class="org-schools__field">
            <span>Statut</span>
            <select v-model="statusFilter">
              <option value="">Tous les statuts</option>
              <option v-for="status in availableStatuses" :key="status" :value="status">
                {{ status === 'ACTIVE' ? 'Active' : 'Inactive' }}
              </option>
            </select>
          </label>

          <button class="org-schools__button org-schools__button--ghost" type="button" :disabled="isBusy" @click="actualiser">
            <RefreshCcw :size="16" />
            <span>Actualiser</span>
          </button>
        </div>
      </SectionBlock>

      <SectionBlock title="Liste des ecoles" description="Projection premium des ecoles rattachees a l organisation.">
        <div v-if="filteredSchools.length === 0" class="org-schools__empty">
          <School :size="20" />
          <div>
            <strong>Aucune ecole n est encore rattachee a cette organisation.</strong>
            <p>Creez une premiere ecole ou rattachez une ecole existante selon le workflow prevu par le systeme.</p>
          </div>
          <button v-if="canCreateSchool" class="org-schools__button org-schools__button--primary" type="button" @click="creerEcole">
            <Plus :size="16" />
            <span>Creer une ecole</span>
          </button>
        </div>

        <div v-else>
          <div class="org-schools__desktop">
            <OrganizationAttachedSchoolsTable
              :schools="filteredSchools"
              :busy="isBusy"
              :can-view="canViewSchool"
              :can-configure="canConfigureSchool"
              :can-toggle-status="canToggleSchoolStatus"
              :can-open-workspace="canOpenSchoolWorkspace"
              :format-date="formaterDate"
              :read-sections="lireSectionsOrganisees"
              :read-modules="lireModulesActives"
              @view="voirEcole"
              @configure="configurerEcole"
              @toggle-status="ouvrirDialogueStatut"
              @open-workspace="ouvrirEcole"
            />
          </div>

          <div class="org-schools__mobile">
            <OrganizationAttachedSchoolsMobileList
              :schools="filteredSchools"
              :busy="isBusy"
              :can-view="canViewSchool"
              :can-configure="canConfigureSchool"
              :can-toggle-status="canToggleSchoolStatus"
              :can-open-workspace="canOpenSchoolWorkspace"
              :format-date="formaterDate"
              :read-sections="lireSectionsOrganisees"
              :read-modules="lireModulesActives"
              @view="voirEcole"
              @configure="configurerEcole"
              @toggle-status="ouvrirDialogueStatut"
              @open-workspace="ouvrirEcole"
            />
          </div>

          <div class="org-schools__progress">
            <div ref="sentinelElement" class="org-schools__sentinel" />
            <p v-if="chargementSupplementaire">Chargement des ecoles suivantes...</p>
            <p v-else-if="toutCharge">Toutes les ecoles ont ete chargees.</p>
            <p v-else>Descendez pour charger automatiquement la suite.</p>
          </div>
        </div>
      </SectionBlock>
    </template>

    <button v-if="showBackToTop" class="org-schools__back-to-top" type="button" @click="revenirEnHaut">
      <ArrowUp :size="18" />
      <span>Haut</span>
    </button>

    <OrganizationConfirmDialog
      :open="statusDialogOpen"
      :busy="isBusy"
      :title="selectedSchool?.actif ? 'Desactiver l ecole' : 'Activer l ecole'"
      :message="selectedSchool?.actif
        ? 'Voulez-vous vraiment desactiver cette ecole ? Les utilisateurs de cette ecole pourraient perdre l acces aux modules actives.'
        : 'Voulez-vous vraiment activer cette ecole dans l organisation ?'"
      :details="selectedSchool ? `Ecole cible : ${selectedSchool.nom} (${selectedSchool.code}).` : 'Aucune ecole selectionnee.'"
      :confirm-label="selectedSchool?.actif ? 'Desactiver' : 'Activer'"
      :processing-label="selectedSchool?.actif ? 'Desactivation en cours...' : 'Activation en cours...'"
      @close="fermerDialogueStatut"
      @confirm="confirmerChangementStatut"
    />
  </PageContainer>
</template>

<script setup lang="ts">
import {
  ArrowLeft,
  ArrowUp,
  Boxes,
  Building2,
  Plus,
  RefreshCcw,
  School,
  Search,
  Undo2,
} from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import OrganizationAttachedSchoolsMobileList from '../components/OrganizationAttachedSchoolsMobileList.vue';
import OrganizationAttachedSchoolsSkeleton from '../components/OrganizationAttachedSchoolsSkeleton.vue';
import OrganizationAttachedSchoolsTable from '../components/OrganizationAttachedSchoolsTable.vue';
import OrganizationConfirmDialog from '../components/OrganizationConfirmDialog.vue';
import { useOrganizationAttachedSchoolsViewModel } from '../viewmodels/useOrganizationAttachedSchoolsViewModel';

const {
  organisation,
  filteredSchools,
  searchTerm,
  statusFilter,
  availableStatuses,
  stats,
  isLoading,
  isBusy,
  errorMessage,
  canCreateSchool,
  canViewSchool,
  canConfigureSchool,
  canToggleSchoolStatus,
  canOpenSchoolWorkspace,
  sentinelElement,
  toutCharge,
  chargementSupplementaire,
  showBackToTop,
  statusDialogOpen,
  selectedSchool,
  formaterDate,
  lireSectionsOrganisees,
  lireModulesActives,
  actualiser,
  revenirOrganisation,
  revenirRegistre,
  voirEcole,
  configurerEcole,
  ouvrirEcole,
  creerEcole,
  ouvrirDialogueStatut,
  fermerDialogueStatut,
  confirmerChangementStatut,
  revenirEnHaut,
} = useOrganizationAttachedSchoolsViewModel();
</script>

<style scoped>
.org-schools__actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:.75rem}
.org-schools__button{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;border-radius:999px;padding:.82rem 1.12rem;font-weight:700;border:1px solid rgba(17,40,63,.12);background:#fff;color:#11283f}
.org-schools__button--primary{background:linear-gradient(135deg,#1147d8,#2563eb);border-color:transparent;color:#fff;box-shadow:0 18px 34px rgba(37,99,235,.22)}
.org-schools__button--ghost{background:#f8fbff}
.org-schools__button:disabled,.org-schools__icon-button:disabled{opacity:.65;cursor:not-allowed;box-shadow:none}
.org-schools__hero{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;padding:1.4rem;border-radius:28px;background:radial-gradient(circle at top left,#f0f6ff 0,#ffffff 52%,#f8fbff 100%);border:1px solid rgba(17,40,63,.08);box-shadow:0 24px 60px rgba(15,23,42,.08)}
.org-schools__hero small{display:inline-flex;padding:.4rem .75rem;border-radius:999px;background:#e9f1ff;color:#1741a6;font-weight:700}
.org-schools__hero h2{margin:.8rem 0 .45rem;color:#11283f}
.org-schools__hero p{margin:0;max-width:72ch;color:#587083;line-height:1.7}
.org-schools__hero-meta{display:grid;grid-template-columns:auto auto auto auto;gap:.55rem 1rem;align-items:center;margin-top:1rem}
.org-schools__hero-meta span{font-size:.78rem;text-transform:uppercase;letter-spacing:.04em;color:#5f7587;font-weight:700}
.org-schools__hero-meta strong{color:#11283f}
.org-schools__status{display:inline-flex;align-items:center;border-radius:999px;padding:.42rem .8rem;font-weight:700}
.org-schools__status.is-active{background:#eaf8ef;color:#166534}
.org-schools__status.is-inactive{background:#fff2f2;color:#b91c1c}
.org-schools__stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-top:1.2rem}
.org-schools__stat-card{display:grid;justify-items:center;text-align:center;gap:.5rem;padding:1.15rem 1rem;border-radius:26px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 22px 45px rgba(15,23,42,.08);transition:all .2s ease}
.org-schools__stat-card:hover{transform:translateY(-2px);box-shadow:0 26px 50px rgba(15,23,42,.12)}
.org-schools__stat-card strong{font-size:1.7rem;color:#11283f}
.org-schools__stat-card span{color:#5f7587;font-weight:600}
.org-schools__filters{display:grid;grid-template-columns:minmax(280px,1.5fr) repeat(2,minmax(180px,1fr));gap:1rem;align-items:end}
.org-schools__field{display:grid;gap:.45rem}
.org-schools__field span{font-size:.85rem;font-weight:700;color:#4b6475}
.org-schools__field input,.org-schools__field select{border-radius:18px;border:1px solid rgba(17,40,63,.12);padding:.92rem 1rem;background:#fbfdff;font:inherit;color:#11283f}
.org-schools__field--search{position:relative}
.org-schools__field--search svg{position:absolute;left:1rem;top:50%;transform:translateY(-50%);color:#6b7f91}
.org-schools__field--search input{padding-left:2.65rem}
.org-schools__empty{display:grid;gap:1rem;align-items:flex-start;padding:1rem 1.05rem;border-radius:22px;background:#f8fbff;color:#20415f}
.org-schools__empty p{margin:.28rem 0 0;color:#587083;line-height:1.6}
.org-schools__progress{display:grid;justify-items:center;gap:.35rem;padding:1rem 1.2rem;background:#fcfdff}
.org-schools__progress p{margin:0;color:#587083}
.org-schools__sentinel{width:100%;height:1px}
.org-schools__desktop{display:block}
.org-schools__mobile{display:none}
.org-schools__back-to-top{position:fixed;right:1.4rem;bottom:1.4rem;display:inline-flex;align-items:center;gap:.45rem;padding:.85rem 1rem;border-radius:999px;border:1px solid rgba(17,40,63,.12);background:#11283f;color:#fff;box-shadow:0 18px 34px rgba(15,23,42,.24);z-index:30}
@media (max-width: 980px){
  .org-schools__filters{grid-template-columns:1fr 1fr}
  .org-schools__field--search{grid-column:1/-1}
}
@media (max-width: 820px){
  .org-schools__desktop{display:none}
  .org-schools__mobile{display:block}
}
@media (max-width: 720px){
  .org-schools__actions,.org-schools__filters{grid-template-columns:1fr;display:grid}
  .org-schools__button{width:100%}
  .org-schools__hero{flex-direction:column}
  .org-schools__hero-meta{grid-template-columns:1fr 1fr}
  .org-schools__back-to-top{right:1rem;bottom:1rem}
}
</style>
