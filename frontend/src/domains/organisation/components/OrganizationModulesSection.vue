<template>
  <section class="org-modules">
    <header class="org-modules__header">
      <div>
        <small>{{ eyebrow }}</small>
        <h3>{{ title }}</h3>
        <p>{{ description }}</p>
      </div>
      <slot name="header-actions" />
    </header>

    <LoadingState
      v-if="loading"
      :title="loadingTitle"
      :message="loadingMessage"
    />

    <EmptyState
      v-else-if="cards.length === 0"
      :title="emptyTitle"
      :message="emptyMessage"
    />

    <template v-else>
      <div v-if="errorMessage" class="org-modules__banner org-modules__banner--error">
        <strong>Enregistrement impossible</strong>
        <p>{{ errorMessage }}</p>
      </div>

      <div v-if="helperMessage" class="org-modules__banner org-modules__banner--info">
        <strong>Lecture utile</strong>
        <p>{{ helperMessage }}</p>
      </div>

      <div class="org-modules__grid">
        <label
          v-for="card in cards"
          :key="card.code"
          class="org-modules__card"
          :class="{
            'is-selected': modelValue.includes(card.code),
            'is-disabled': card.disabled,
          }"
        >
          <div class="org-modules__checkbox">
            <input
              :checked="modelValue.includes(card.code)"
              type="checkbox"
              :disabled="card.disabled || saveBusy"
              @change="mettreAJourSelection(card.code, ($event.target as HTMLInputElement).checked)"
            />
          </div>

          <div class="org-modules__content">
            <div class="org-modules__row">
              <strong>{{ card.label }}</strong>
              <span
                v-if="card.stateLabel"
                class="org-modules__badge"
                :class="card.disabled ? 'is-muted' : 'is-active'"
              >
                {{ card.stateLabel }}
              </span>
            </div>
            <p>{{ card.description }}</p>
            <small>{{ card.helper }}</small>
          </div>
        </label>
      </div>

      <footer class="org-modules__footer">
        <div class="org-modules__footer-copy">
          <strong>{{ selectionSummary }}</strong>
          <p>{{ footerMessage }}</p>
        </div>
        <button
          class="org-modules__button"
          type="button"
          :disabled="saveDisabled || saveBusy"
          @click="$emit('save')"
        >
          {{ saveBusy ? processingLabel : saveLabel }}
        </button>
      </footer>
    </template>
  </section>
</template>

<script setup lang="ts">
import EmptyState from '../../../shared/ui/EmptyState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';

export interface OrganizationModulesSectionCard {
  code: string;
  label: string;
  description: string;
  helper: string;
  disabled?: boolean;
  stateLabel?: string;
}

const props = withDefaults(defineProps<{
  eyebrow?: string;
  title: string;
  description: string;
  modelValue: readonly string[];
  cards: readonly OrganizationModulesSectionCard[];
  loading?: boolean;
  loadingTitle?: string;
  loadingMessage?: string;
  emptyTitle: string;
  emptyMessage: string;
  helperMessage?: string | null;
  errorMessage?: string | null;
  selectionSummary: string;
  footerMessage: string;
  saveLabel: string;
  processingLabel?: string;
  saveDisabled?: boolean;
  saveBusy?: boolean;
}>(), {
  eyebrow: 'Modules',
  loading: false,
  loadingTitle: 'Chargement des modules',
  loadingMessage: 'Le systeme relit les modules actuellement disponibles.',
  helperMessage: null,
  errorMessage: null,
  processingLabel: 'Enregistrement...',
  saveDisabled: false,
  saveBusy: false,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: string[]): void;
  (event: 'save'): void;
}>();

function mettreAJourSelection(code: string, checked: boolean): void {
  const current = new Set(props.modelValue);
  if (checked) {
    current.add(code);
  } else {
    current.delete(code);
  }

  emit('update:modelValue', [...current]);
}
</script>

<style scoped>
.org-modules{display:grid;gap:1rem}
.org-modules__header{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start}
.org-modules__header small{display:block;color:#0d5f7a;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
.org-modules__header h3{margin:.2rem 0 .35rem;color:#11283f;font-size:1.35rem}
.org-modules__header p{margin:0;color:#587083;line-height:1.6;max-width:72ch}
.org-modules__banner{display:grid;gap:.28rem;padding:1rem 1.05rem;border-radius:22px;border:1px solid rgba(17,40,63,.08)}
.org-modules__banner strong{color:#11283f}
.org-modules__banner p{margin:0;color:#587083;line-height:1.55}
.org-modules__banner--info{background:#f6fbff}
.org-modules__banner--error{background:#fff4f4;border-color:rgba(185,28,28,.12)}
.org-modules__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem}
.org-modules__card{display:grid;grid-template-columns:auto minmax(0,1fr);gap:.9rem;align-items:flex-start;padding:1rem 1.05rem;border-radius:24px;background:linear-gradient(180deg,#fbfdff,#ffffff);border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 40px rgba(15,23,42,.06);transition:all .2s ease;cursor:pointer}
.org-modules__card:hover{transform:translateY(-2px);box-shadow:0 24px 48px rgba(15,23,42,.1)}
.org-modules__card.is-selected{border-color:rgba(13,95,122,.28);box-shadow:0 22px 48px rgba(13,95,122,.16)}
.org-modules__card.is-disabled{opacity:.72;cursor:not-allowed;background:linear-gradient(180deg,#f5f7fa,#ffffff)}
.org-modules__checkbox{padding-top:.2rem}
.org-modules__checkbox input{width:18px;height:18px;accent-color:#0d5f7a}
.org-modules__content{display:grid;gap:.45rem}
.org-modules__row{display:flex;justify-content:space-between;gap:.75rem;align-items:flex-start}
.org-modules__content strong{color:#11283f}
.org-modules__content p{margin:0;color:#587083;line-height:1.55}
.org-modules__content small{color:#6a8091;line-height:1.5}
.org-modules__badge{display:inline-flex;align-items:center;justify-content:center;min-height:28px;padding:.2rem .65rem;border-radius:999px;font-size:.8rem;font-weight:700;white-space:nowrap}
.org-modules__badge.is-active{background:#eaf8ef;color:#166534}
.org-modules__badge.is-muted{background:#eef2f7;color:#516579}
.org-modules__footer{display:flex;justify-content:space-between;gap:1rem;align-items:center;padding:1rem 1.05rem;border-radius:24px;background:linear-gradient(180deg,#f8fbff,#ffffff);border:1px solid rgba(17,40,63,.08)}
.org-modules__footer-copy{display:grid;gap:.25rem}
.org-modules__footer-copy strong{color:#11283f}
.org-modules__footer-copy p{margin:0;color:#587083;line-height:1.55}
.org-modules__button{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:.85rem 1.15rem;border-radius:18px;border:1px solid rgba(9,95,118,.22);background:linear-gradient(135deg,#0b5d7a 0%, #1180a3 52%, #1ca6bf 100%);color:#fff;font-weight:700;box-shadow:0 18px 34px rgba(14,110,138,.24)}
.org-modules__button:disabled{opacity:.6;cursor:not-allowed;box-shadow:none}

@media (max-width: 720px){
  .org-modules__header,.org-modules__footer{grid-template-columns:1fr;display:grid}
  .org-modules__button{width:100%}
}
</style>
