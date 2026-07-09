<template>
  <PageContainer>
    <nav class="org-edit__breadcrumb" aria-label="Fil d Ariane">
      <span>Plateforme</span>
      <ChevronRight :size="14" />
      <span>Organisations</span>
      <ChevronRight :size="14" />
      <button type="button" class="org-edit__breadcrumb-link" @click="retournerRegistre">
        Registre des organisations
      </button>
      <ChevronRight :size="14" />
      <strong>Modifier organisation</strong>
    </nav>

    <PageHeader
      eyebrow="Organisation"
      title="Modifier organisation"
      description="Mettez a jour l organisation et son responsable principal depuis une seule fiche claire et professionnelle."
    >
      <template #actions>
        <div class="org-edit__actions">
          <button class="org-edit__button org-edit__button--ghost" type="button" @click="retournerRegistre">
            <LayoutList :size="16" />
            <span>Retour au registre</span>
          </button>
          <button class="org-edit__button org-edit__button--ghost" type="button" @click="retournerDetail">
            <ArrowLeft :size="16" />
            <span>Voir organisation</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <OrganizationEditSkeleton v-if="isLoading && !organisation" />
    <ErrorState
      v-else-if="errorMessage && !organisation"
      title="Impossible de charger les informations"
      :message="errorMessage"
    />
    <template v-else-if="organisation">
      <section class="org-edit__hero">
        <div class="org-edit__hero-main">
          <div class="org-edit__eyebrow">
            <small>{{ organisation.code }}</small>
            <span class="org-edit__code-label">Code organisation</span>
          </div>
          <h2>Modifier organisation</h2>
          <p>Cette fiche centralise les informations institutionnelles et le responsable principal actuellement rattache a l organisation.</p>
        </div>
        <div class="org-edit__hero-side">
          <span :class="['org-edit__status', organisation.actif ? 'is-active' : 'is-inactive']">
            {{ organisation.actif ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </section>

      <form class="org-edit__form-stack" @submit.prevent="enregistrer">
        <SectionBlock
          title="Informations organisationnelles"
          description="Modifiez les champs metier relisibles dans le registre et la fiche detaillee."
        >
          <div class="org-edit__form">
            <label class="org-edit__field org-edit__field--wide">
              <span>Nom de l organisation *</span>
              <input
                v-model="form.nom"
                type="text"
                placeholder="Nom de l organisation"
                :aria-invalid="nomError ? 'true' : 'false'"
              />
              <small v-if="nomError" class="org-edit__error">{{ nomError }}</small>
            </label>

            <label class="org-edit__field">
              <span>Type d organisation *</span>
              <select v-model="form.typeOrganisation">
                <option v-for="type in typeOptions" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </label>

            <label class="org-edit__field">
              <span>Statut</span>
              <input :value="organisation.actif ? 'Active' : 'Inactive'" type="text" readonly />
              <small>Le statut reste pilote depuis la fiche de consultation.</small>
            </label>

            <label class="org-edit__field org-edit__field--wide">
              <span>Description</span>
              <textarea v-model="form.description" rows="4" placeholder="Description de l organisation" />
              <small>Cette description alimente les vues de pilotage si elle est renseignee.</small>
            </label>
          </div>
        </SectionBlock>

        <SectionBlock
          title="Responsable principal"
          description="Mettez a jour les informations affichables du responsable principal rattache a l organisation."
        >
          <div class="org-edit__form">
            <label class="org-edit__field">
              <span>Nom complet</span>
              <input v-model="form.responsableNomComplet" type="text" placeholder="Nom complet du responsable" />
            </label>

            <label class="org-edit__field">
              <span>Telephone</span>
              <input v-model="form.responsableTelephone" type="tel" placeholder="+243..." />
            </label>

            <label class="org-edit__field">
              <span>Adresse email</span>
              <input
                v-model="form.responsableEmail"
                type="email"
                placeholder="responsable@organisation.cd"
                :aria-invalid="responsableEmailError ? 'true' : 'false'"
              />
              <small v-if="responsableEmailError" class="org-edit__error">{{ responsableEmailError }}</small>
            </label>

            <label class="org-edit__field">
              <span>Identifiant</span>
              <input v-model="form.responsableIdentifiant" type="text" placeholder="responsable.org" />
            </label>
          </div>
        </SectionBlock>

        <SectionBlock
          title="Traçabilite"
          description="Le backend conserve la creation, la version courante et la derniere modification reelle."
        >
          <div class="org-edit__meta-grid">
            <article class="org-edit__meta-card">
              <small>Date de creation</small>
              <strong>{{ formaterDate(organisation.creeLe, true) }}</strong>
            </article>
            <article class="org-edit__meta-card">
              <small>Derniere modification</small>
              <strong>{{ lireDerniereModification() }}</strong>
            </article>
            <article class="org-edit__meta-card">
              <small>Version</small>
              <strong>v{{ organisation.version }}</strong>
            </article>
          </div>
        </SectionBlock>

        <div class="org-edit__footer">
          <button class="org-edit__button org-edit__button--ghost" type="button" @click="annuler">
            Annuler
          </button>
          <button class="org-edit__button org-edit__button--primary" type="submit" :disabled="!canSubmit">
            <LoaderCircle v-if="isSaving" class="org-edit__spinner" :size="16" />
            <span>{{ isSaving ? 'Enregistrement...' : 'Enregistrer les modifications' }}</span>
          </button>
        </div>
      </form>
    </template>

    <OrganizationConfirmDialog
      :open="confirmLeaveOpen"
      title="Quitter sans enregistrer"
      message="Des modifications n ont pas ete enregistrees. Voulez-vous vraiment quitter cette page ?"
      details="Les changements saisis dans le champ nom seront perdus si vous quittez maintenant."
      confirm-label="Quitter la page"
      processing-label="Redirection..."
      @close="fermerConfirmationSortie"
      @confirm="confirmerSortieSansSauvegarde"
    />
  </PageContainer>
</template>

<script setup lang="ts">
import { ArrowLeft, ChevronRight, LayoutList, LoaderCircle } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import OrganizationConfirmDialog from '../components/OrganizationConfirmDialog.vue';
import OrganizationEditSkeleton from '../components/OrganizationEditSkeleton.vue';
import { useOrganizationEditViewModel } from '../viewmodels/useOrganizationEditViewModel';

const {
  organisation,
  form,
  isLoading,
  isSaving,
  errorMessage,
  canSubmit,
  nomError,
  typeOptions,
  responsableEmailError,
  confirmLeaveOpen,
  enregistrer,
  annuler,
  retournerRegistre,
  retournerDetail,
  fermerConfirmationSortie,
  confirmerSortieSansSauvegarde,
  formaterDate,
  lireDerniereModification,
} = useOrganizationEditViewModel();
</script>

<style scoped>
.org-edit__breadcrumb{display:flex;flex-wrap:wrap;align-items:center;gap:.45rem;margin-bottom:1rem;color:#5d7388;font-size:.95rem}
.org-edit__breadcrumb strong{color:#17324a}
.org-edit__breadcrumb-link{padding:0;border:none;background:transparent;color:#0d5f7a;font-weight:700}
.org-edit__actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:.75rem}
.org-edit__hero{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;padding:1.5rem;border-radius:28px;background:radial-gradient(circle at top left,#eefbfd 0,#ffffff 52%,#f4fbfd 100%);border:1px solid rgba(17,40,63,.08);box-shadow:0 24px 60px rgba(15,23,42,.08)}
.org-edit__hero-main,.org-edit__hero-side{display:grid;gap:.8rem}
.org-edit__eyebrow{display:flex;flex-wrap:wrap;align-items:center;gap:.6rem}
.org-edit__hero small{display:inline-flex;padding:.4rem .75rem;border-radius:999px;background:#e6f7fb;color:#0d5f7a;font-weight:700}
.org-edit__code-label{color:#5f7587;font-weight:700}
.org-edit__hero h2{margin:0;color:#11283f;font-size:1.9rem}
.org-edit__hero p{margin:0;max-width:68ch;color:#587083;line-height:1.7}
.org-edit__status{display:inline-flex;align-items:center;border-radius:999px;padding:.42rem .8rem;font-weight:700}
.org-edit__status.is-active{background:#eaf8ef;color:#166534}
.org-edit__status.is-inactive{background:#fff2f2;color:#b91c1c}
.org-edit__form{display:grid;gap:1.1rem}
.org-edit__form-stack{display:grid;gap:1.1rem}
.org-edit__form :deep(.section-block){overflow:visible}
.org-edit__field input:focus,.org-edit__field textarea:focus,.org-edit__field select:focus{outline:none;border-color:#1180a3;box-shadow:0 0 0 4px rgba(17,128,163,.12);background:#fff}
.org-edit__field{display:grid;gap:.45rem}
.org-edit__field span{font-size:.85rem;font-weight:700;color:#4b6475}
.org-edit__field input,.org-edit__field textarea,.org-edit__field select{border-radius:18px;border:1px solid rgba(17,40,63,.12);padding:.95rem 1rem;background:#fbfdff;font:inherit;color:#11283f}
.org-edit__field input[readonly],.org-edit__field textarea[readonly]{background:#f3f6fa;color:#587083}
.org-edit__field small{color:#587083;line-height:1.5}
.org-edit__field--wide{grid-column:1/-1}
.org-edit__error{color:#b91c1c !important;font-weight:700}
.org-edit__meta-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem}
.org-edit__meta-card{display:grid;gap:.4rem;padding:1rem 1.05rem;border-radius:22px;background:linear-gradient(180deg,#fbfdff,#ffffff);border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 36px rgba(15,23,42,.06)}
.org-edit__meta-card small{color:#5f7587;font-weight:700}
.org-edit__meta-card strong{color:#11283f}
.org-edit__footer{display:flex;justify-content:flex-end;gap:.8rem;padding-top:.15rem}
.org-edit__button{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;min-height:48px;border-radius:18px;padding:.82rem 1.15rem;font-weight:700;border:1px solid rgba(17,40,63,.12);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(245,249,253,.98));color:#11283f;box-shadow:0 10px 24px rgba(15,23,42,.06), inset 0 1px 0 rgba(255,255,255,.92)}
.org-edit__button--ghost{background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(245,249,253,.98))}
.org-edit__button--primary{background:linear-gradient(135deg,#0b5d7a 0%, #1180a3 52%, #1ca6bf 100%);border-color:rgba(9,95,118,.22);color:#fff;box-shadow:0 18px 34px rgba(14,110,138,.22)}
.org-edit__button:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 16px 28px rgba(15,23,42,.1)}
.org-edit__button:disabled{opacity:.6;cursor:not-allowed;box-shadow:none;transform:none}
.org-edit__spinner{animation:org-edit-spin .9s linear infinite}
@keyframes org-edit-spin{to{transform:rotate(360deg)}}
@media (max-width: 720px){
  .org-edit__hero{flex-direction:column}
  .org-edit__actions,.org-edit__footer{justify-content:stretch}
  .org-edit__button{width:100%}
}
</style>
