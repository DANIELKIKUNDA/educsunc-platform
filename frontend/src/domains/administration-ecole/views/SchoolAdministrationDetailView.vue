<template>
  <PageContainer>
    <nav class="school-detail__breadcrumb" aria-label="Fil d’Ariane">
      <RouterLink :to="returnPath">{{ returnLabel }}</RouterLink><ChevronRight :size="15" />
      <span>{{ school?.nom || 'Fiche école' }}</span>
    </nav>

    <div v-if="store.state.status === 'loading'" class="school-admin__skeleton-grid" aria-label="Chargement de la fiche">
      <div v-for="index in 4" :key="index" class="school-admin__skeleton-card" />
    </div>
    <ErrorState v-else-if="store.state.status === 'error'" title="Fiche indisponible" :message="store.state.errorMessage ?? 'Cette fiche ne peut pas être ouverte pour le moment.'" />
    <EmptyState v-else-if="!school" title="École introuvable" message="Revenez au registre pour choisir un établissement." />

    <template v-else>
      <header class="school-detail__hero">
        <div class="school-detail__hero-main">
          <div class="school-detail__monogram" aria-hidden="true">{{ (school.sigle || school.nom).slice(0, 2).toUpperCase() }}</div>
          <div>
            <div class="school-detail__eyebrow">Administration école · {{ school.code }}</div>
            <h1>{{ school.nom }}</h1>
            <div class="school-detail__meta">
              <span><Building2 :size="16" />{{ organization?.nom || 'Organisation non renseignée' }}</span>
              <span><MapPin :size="16" />{{ school.ville || school.provinceEducationnelle || 'Localisation à compléter' }}</span>
            </div>
          </div>
        </div>
        <div class="school-detail__hero-side">
          <div class="school-detail__badges">
            <SchoolStatusBadge :active="school.actif" />
            <SchoolModeBadge :mode="school.modeExploitation" />
            <span class="school-detail__completion" :class="{ 'school-detail__completion--complete': completeness.percentage === 100 }">
              Fiche {{ completeness.percentage }} % complète
            </span>
          </div>
          <div v-if="canMutateDetail" class="school-detail__actions">
            <button class="school-detail__button school-detail__button--primary" type="button" @click="openModal('identity')"><Pencil :size="17" />Modifier</button>
            <button v-if="canManageModules" class="school-detail__button" type="button" @click="openModal('modules')"><Blocks :size="17" />Gérer les modules</button>
            <details class="school-detail__more">
              <summary class="school-detail__button"><Ellipsis :size="18" />Autres actions</summary>
              <div class="school-detail__more-menu">
                <button type="button" @click="openModal('rename')"><CaseUpper :size="16" />Renommer l’école</button>
                <button type="button" @click="openModal('mode')"><RefreshCw :size="16" />Changer le mode</button>
                <button type="button" :class="{ 'is-danger': school.actif }" @click="openLifecycleModal(school.actif ? 'deactivate' : 'activate')">
                  <Power :size="16" />{{ school.actif ? 'Désactiver l’école' : 'Activer l’école' }}
                </button>
              </div>
            </details>
          </div>
        </div>
      </header>

      <div v-if="store.state.lastMutationMessage" class="school-admin__banner" role="status">{{ store.state.lastMutationMessage }}</div>

      <main class="school-detail__layout">
        <div class="school-detail__primary-column">
          <section class="school-detail__card">
            <div class="school-detail__section-heading"><div><small>Établissement</small><h2>Identité et coordonnées</h2></div><button v-if="canMutateDetail" type="button" @click="openModal('identity')">Modifier</button></div>
            <div class="school-detail__information-grid">
              <InfoItem label="Nom officiel" :value="school.nom" />
              <InfoItem label="Sigle" :value="school.sigle" />
              <InfoItem label="Code" :value="school.code" />
              <InfoItem label="Téléphone" :value="school.telephone" />
              <InfoItem label="E-mail" :value="school.email" />
              <InfoItem label="Adresse" :value="school.adresse" wide />
              <InfoItem label="Province éducationnelle" :value="school.provinceEducationnelle" />
              <InfoItem label="Ville" :value="school.ville" />
              <InfoItem label="Commune ou territoire" :value="school.communeOuTerritoire" />
            </div>
          </section>

          <section class="school-detail__card">
            <div class="school-detail__section-heading"><div><small>Services disponibles</small><h2>Modules de l’école</h2></div><button v-if="canManageModules" type="button" @click="openModal('modules')">Gérer les modules</button></div>
            <div v-if="modulesLoading" class="school-detail__module-skeleton">Lecture des modules…</div>
            <div v-else-if="modulesErrorMessage" class="school-detail__inline-error">{{ modulesErrorMessage }} <button type="button" @click="loadModules">Réessayer</button></div>
            <div v-else class="school-detail__module-columns">
              <ModuleGroup title="Autorisés par l’organisation" :items="moduleGroups.allowed" empty-message="Aucun module autorisé." />
              <ModuleGroup title="Activés pour l’école" :items="moduleGroups.enabled" empty-message="Aucun module activé." tone="active" />
              <ModuleGroup title="Disponibles à activer" :items="moduleGroups.available" empty-message="Tous les modules autorisés sont déjà activés." tone="available" />
            </div>
          </section>
        </div>

        <aside class="school-detail__side-column">
          <section class="school-detail__card school-detail__operation-card">
            <small>Fonctionnement</small><h2>Situation actuelle</h2>
            <div class="school-detail__operation-row"><span>Statut</span><SchoolStatusBadge :active="school.actif" /></div>
            <div class="school-detail__operation-row"><span>Mode d’exploitation</span><SchoolModeBadge :mode="school.modeExploitation" /></div>
            <div class="school-detail__operation-row"><span>Organisation</span><strong>{{ organization?.nom || 'Non renseignée' }}</strong></div>
          </section>

          <section class="school-detail__card">
            <small>Qualité de la fiche</small><h2>Complétude</h2>
            <div class="school-detail__progress-label"><strong>{{ completeness.percentage }} %</strong><span>{{ completeness.missing.length ? `${completeness.missing.length} information(s) à compléter` : 'Toutes les informations sont renseignées' }}</span></div>
            <div class="school-detail__progress"><span :style="{ width: `${completeness.percentage}%` }" /></div>
            <div v-if="completeness.missing.length" class="school-detail__missing-list"><span v-for="item in completeness.missing" :key="item">{{ item }}</span></div>
            <button v-if="canMutateDetail && completeness.missing.length" class="school-detail__text-action" type="button" @click="openModal('identity')">Compléter la fiche</button>
          </section>

          <section class="school-detail__card">
            <small>Traçabilité</small><h2>Historique de la fiche</h2>
            <div class="school-detail__timeline">
              <div v-if="school.modifieLe"><span class="school-detail__timeline-dot" /><p><strong>Dernière modification</strong>{{ formatDate(school.modifieLe) }}<em>{{ school.modifieParNom || 'Identité archivée' }}</em></p></div>
              <div v-else><span class="school-detail__timeline-dot" /><p><strong>Aucune modification</strong>La fiche est identique à sa création.</p></div>
              <div><span class="school-detail__timeline-dot school-detail__timeline-dot--muted" /><p><strong>Création</strong>{{ formatDate(school.creeLe) }}<em>{{ school.creeParNom || 'Auteur non disponible' }}</em></p></div>
            </div>
          </section>
        </aside>
      </main>

      <SchoolActionModal :open="activeModal === 'identity'" title="Modifier l’identité de l’école" description="Mettez à jour les coordonnées institutionnelles utiles aux documents et aux échanges." submit-label="Enregistrer les informations" :can-submit="identityEvaluation.canSubmit" :pending="store.state.mutationStatus === 'loading'" :dirty="identityEvaluation.canSubmit" @close="closeModal" @discard="closeModal" @submit="updateInstitutionalInfo">
        <div class="school-admin__form-grid">
          <label class="school-admin__field"><span>Sigle</span><input v-model="identityForm.sigle" type="text" autocomplete="organization" /></label>
          <label class="school-admin__field"><span>Téléphone</span><input v-model="identityForm.telephone" type="tel" autocomplete="tel" /></label>
          <label class="school-admin__field"><span>E-mail</span><input v-model="identityForm.email" type="email" autocomplete="email" /></label>
          <label class="school-admin__field"><span>Province éducationnelle</span><input v-model="identityForm.provinceEducationnelle" type="text" /></label>
          <label class="school-admin__field"><span>Ville</span><input v-model="identityForm.ville" type="text" /></label>
          <label class="school-admin__field"><span>Commune ou territoire</span><input v-model="identityForm.communeOuTerritoire" type="text" /></label>
          <label class="school-admin__field school-admin__field--wide"><span>Adresse</span><input v-model="identityForm.adresse" type="text" autocomplete="street-address" /></label>
        </div>
        <p v-if="identityEvaluation.disableReason" class="school-admin__helper">{{ identityEvaluation.disableReason }}</p>
      </SchoolActionModal>

      <SchoolActionModal :open="activeModal === 'rename'" title="Renommer l’école" description="Le nouveau nom officiel sera immédiatement visible dans le registre." submit-label="Enregistrer le nouveau nom" :can-submit="renameEvaluation.canSubmit" :pending="store.state.mutationStatus === 'loading'" :dirty="renameEvaluation.canSubmit" @close="closeModal" @discard="closeModal" @submit="renameSchool">
        <label class="school-admin__field"><span>Nouveau nom officiel</span><input v-model="renameTarget" type="text" autocomplete="organization" /></label>
        <p v-if="renameEvaluation.disableReason" class="school-admin__helper">{{ renameEvaluation.disableReason }}</p>
      </SchoolActionModal>

      <SchoolActionModal :open="activeModal === 'mode'" title="Changer le mode d’exploitation" description="Choisissez le fonctionnement adapté à la situation actuelle de l’établissement." submit-label="Enregistrer le mode" :can-submit="modeEvaluation.canSubmit" :pending="store.state.mutationStatus === 'loading'" :dirty="modeEvaluation.canSubmit" @close="closeModal" @discard="closeModal" @submit="updateMode">
        <div class="school-detail__mode-options">
          <label v-for="option in schoolModeOptions" :key="option.value" :class="{ 'is-selected': identityForm.modeExploitation === option.value }"><input v-model="identityForm.modeExploitation" type="radio" :value="option.value" /><span><strong>{{ option.label }}</strong>{{ option.description }}</span></label>
        </div>
      </SchoolActionModal>

      <SchoolActionModal :open="activeModal === 'modules'" title="Gérer les modules de l’école" description="Activez uniquement les modules préalablement autorisés par l’organisation." submit-label="Enregistrer les changements" :can-submit="canSaveModules" :pending="modulesSaving" :dirty="modulesDirty" @close="closeModal" @discard="closeModal" @submit="saveModules">
        <div v-if="modulesErrorMessage" class="school-detail__inline-error">{{ modulesErrorMessage }}</div>
        <div v-if="modulesAllowed.length" class="school-detail__module-picker">
          <label v-for="module in moduleGroups.allowed" :key="module.code" :class="{ 'is-selected': modulesDraft.includes(module.code) }"><input type="checkbox" :checked="modulesDraft.includes(module.code)" @change="toggleModule(module.code)" /><span><strong>{{ module.label }}</strong>{{ module.description }}</span></label>
        </div>
        <EmptyState v-else title="Aucun module disponible" message="L’organisation doit d’abord autoriser des modules pour cette école." />
      </SchoolActionModal>

      <SchoolLifecycleModal :open="lifecycleModalOpen" :action="lifecycleAction" :school-name="school.nom" :pending="store.state.mutationStatus === 'loading'" @close="lifecycleModalOpen = false" @confirm="confirmLifecycle" />
    </template>
  </PageContainer>
</template>

<script setup lang="ts">
import { Blocks, Building2, CaseUpper, ChevronRight, Ellipsis, MapPin, Pencil, Power, RefreshCw } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import InfoItem from '../components/SchoolDetailInfoItem.vue';
import ModuleGroup from '../components/SchoolModuleGroup.vue';
import SchoolActionModal from '../components/SchoolActionModal.vue';
import SchoolLifecycleModal from '../components/SchoolLifecycleModal.vue';
import SchoolModeBadge from '../components/SchoolModeBadge.vue';
import SchoolStatusBadge from '../components/SchoolStatusBadge.vue';
import { useSchoolAdministrationDetailViewModel } from '../viewmodels/useSchoolAdministrationDetailViewModel';

const {
  store, school, organization, canMutateDetail, canManageModules, returnPath, returnLabel,
  activeModal, renameTarget, identityForm, schoolModeOptions, renameEvaluation, modeEvaluation,
  identityEvaluation, completeness, modulesLoading, modulesSaving, modulesErrorMessage,
  modulesAllowed, modulesDraft, moduleGroups, modulesDirty, canSaveModules,
  lifecycleModalOpen, lifecycleAction, formatDate, loadModules, openModal, closeModal,
  renameSchool, updateMode, updateInstitutionalInfo, toggleModule, saveModules,
  openLifecycleModal, confirmLifecycle,
} = useSchoolAdministrationDetailViewModel();
</script>

<style src="../school-administration.css"></style>
