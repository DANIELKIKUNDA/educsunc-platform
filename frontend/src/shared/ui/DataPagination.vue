<template>
  <div class="data-pagination">
    <div class="data-pagination__summary-shell">
      <p class="data-pagination__summary">
        <span class="data-pagination__summary-value">{{ visibleItems }}</span>
        <span class="data-pagination__summary-separator">/</span>
        <span>{{ totalItems }} elements affichables</span>
      </p>
      <p class="data-pagination__hint">
        Chargement progressif intelligent
      </p>
    </div>

    <div class="data-pagination__actions">
      <div class="data-pagination__sizes" aria-label="Taille du lot affiche">
        <button
          v-for="option in pageSizeOptions"
          :key="option"
          class="data-pagination__size-chip"
          :class="{ 'data-pagination__size-chip--active': rowsPerPage === option }"
          type="button"
          :aria-pressed="rowsPerPage === option"
          @click="emit('update:rows-per-page', option)"
        >
          {{ option }}
        </button>
      </div>

      <div class="data-pagination__pager" v-if="totalItems > 0">
        <button
          v-if="canLoadMore"
          class="data-pagination__button data-pagination__button--primary"
          type="button"
          aria-label="Charger plus"
          @click="$emit('loadMore')"
        >
          <ChevronsDown :size="16" />
          <span>Charger plus</span>
        </button>

        <button
          v-if="canLoadMore"
          class="data-pagination__button"
          type="button"
          aria-label="Tout afficher"
          @click="$emit('showAll')"
        >
          <ListEnd :size="16" />
          <span>Tout afficher</span>
        </button>

        <button
          v-if="canReset"
          class="data-pagination__button"
          type="button"
          aria-label="Revenir au lot initial"
          @click="$emit('reset')"
        >
          <RotateCcw :size="16" />
          <span>Lot initial</span>
        </button>
      </div>
    </div>

    <div
      v-if="autoLoad && canLoadMore"
      ref="sentinelRef"
      class="data-pagination__sentinel"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ChevronsDown, ListEnd, RotateCcw } from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  visibleItems: number;
  totalItems: number;
  rowsPerPage: number;
  canLoadMore: boolean;
  canReset?: boolean;
  pageSizeOptions?: number[];
  autoLoad?: boolean;
  start?: number;
  end?: number;
  currentPage?: number;
  totalPages?: number;
}>(), {
  canReset: false,
  pageSizeOptions: () => [10, 25, 50],
  autoLoad: true,
  start: 0,
  end: 0,
  currentPage: 1,
  totalPages: 1,
});

const emit = defineEmits<{
  (event: 'update:rows-per-page', value: number): void;
  (event: 'update:current-page', value: number): void;
  (event: 'loadMore'): void;
  (event: 'showAll'): void;
  (event: 'reset'): void;
}>();

const sentinelRef = ref<HTMLDivElement | null>(null);
let observer: IntersectionObserver | null = null;
let autoLoadLocked = false;

function installerObserver(): void {
  observer?.disconnect();
  observer = null;

  if (!props.autoLoad || !props.canLoadMore || !sentinelRef.value || typeof IntersectionObserver === 'undefined') {
    return;
  }

  observer = new IntersectionObserver((entries) => {
    const [entry] = entries;
    if (entry?.isIntersecting && props.canLoadMore && !autoLoadLocked) {
      autoLoadLocked = true;
      emit('loadMore');
    }
  }, {
    rootMargin: '32px 0px',
    threshold: 0.01,
  });

  observer.observe(sentinelRef.value);
}

onMounted(installerObserver);
onBeforeUnmount(() => observer?.disconnect());

watch(() => [props.canLoadMore, props.autoLoad, sentinelRef.value], installerObserver);
watch(
  () => props.visibleItems,
  async (current, previous) => {
    if (current > previous) {
      autoLoadLocked = false;
      await nextTick();
      installerObserver();
    }
  },
);
watch(
  () => props.canLoadMore,
  (canLoadMore) => {
    if (!canLoadMore) {
      autoLoadLocked = false;
    }
  },
);
</script>

<style scoped>
.data-pagination {
  display: grid;
  gap: 1rem;
  padding: 1rem 0.2rem 0;
}

.data-pagination__summary-shell {
  display: grid;
  gap: 0.3rem;
}

.data-pagination__summary {
  margin: 0;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.45rem;
  color: var(--ui-text);
  font-weight: 700;
  line-height: 1.5;
}

.data-pagination__summary-value {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--ui-primary);
}

.data-pagination__summary-separator {
  color: var(--ui-text-muted);
}

.data-pagination__hint {
  margin: 0;
  color: var(--ui-text-muted);
  font-size: 0.9rem;
  line-height: 1.45;
}

.data-pagination__actions,
.data-pagination__pager,
.data-pagination__sizes {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.85rem;
}

.data-pagination__actions {
  justify-content: space-between;
}

.data-pagination__sizes {
  border-radius: 999px;
  padding: 0.28rem;
  background: linear-gradient(180deg, var(--ui-surface-subtle), var(--ui-surface-muted));
  border: 1px solid var(--ui-border);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--ui-surface) 85%, transparent),
    var(--ui-shadow-sm);
}

.data-pagination__size-chip {
  min-width: 62px;
  min-height: 42px;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.65rem 0.95rem;
  background: transparent;
  color: var(--ui-text-muted);
  font: inherit;
  font-weight: 700;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.data-pagination__size-chip:hover {
  transform: translateY(-1px);
  color: var(--ui-primary);
  border-color: color-mix(in srgb, var(--ui-primary) 22%, transparent);
  background: color-mix(in srgb, var(--ui-surface) 80%, transparent);
}

.data-pagination__size-chip--active {
  color: var(--ui-primary-contrast);
  border-color: transparent;
  background: linear-gradient(135deg, var(--ui-primary), color-mix(in srgb, var(--ui-primary) 68%, #2eb7c9));
  box-shadow: var(--ui-shadow-sm);
}

.data-pagination__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  min-height: 44px;
  border-radius: 14px;
  border: 1px solid var(--ui-border-strong);
  background: var(--ui-surface);
  color: var(--ui-text-strong);
  padding: 0.78rem 0.95rem;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.data-pagination__button:hover {
  transform: translateY(-1px);
  background: var(--ui-surface-subtle);
  box-shadow: var(--ui-shadow-sm);
}

.data-pagination__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.data-pagination__button--primary {
  background: linear-gradient(135deg, var(--ui-primary), color-mix(in srgb, var(--ui-primary) 68%, #2eb7c9));
  color: var(--ui-primary-contrast);
  border-color: transparent;
  box-shadow: var(--ui-shadow-md);
}

.data-pagination__sentinel {
  width: 100%;
  height: 1px;
}

@media (max-width: 720px) {
  .data-pagination,
  .data-pagination__actions {
    align-items: stretch;
  }

  .data-pagination__sizes {
    justify-content: center;
  }

  .data-pagination__pager {
    flex-direction: column;
    align-items: stretch;
  }

  .data-pagination__button {
    width: 100%;
  }
}
</style>
