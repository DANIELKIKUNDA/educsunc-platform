<template>
  <div class="premium-tabs" role="tablist" :aria-label="ariaLabel">
    <button
      v-for="tab in tabs"
      :key="tab.code"
      class="premium-tabs__tab"
      :class="{ 'premium-tabs__tab--active': modelValue === tab.code }"
      type="button"
      role="tab"
      :aria-selected="modelValue === tab.code"
      :aria-label="tab.ariaLabel ?? tab.label"
      @click="$emit('update:modelValue', tab.code)"
    >
      <component :is="tab.icon" v-if="tab.icon" :size="16" />
      <span>{{ tab.label }}</span>
      <small v-if="tab.count !== undefined">{{ tab.count }}</small>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  modelValue: string;
  ariaLabel: string;
  tabs: ReadonlyArray<{
    code: string;
    label: string;
    icon?: Component;
    count?: string | number;
    ariaLabel?: string;
  }>;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<style scoped>
.premium-tabs{
  display:flex;
  /* Keep the first and last tabs reachable when the row is wider than its viewport. */
  justify-content:safe center;
  gap:.75rem;
  overflow:auto;
  width:100%;
  padding:.15rem 1.25rem .35rem;
  margin:0 auto;
  scrollbar-width:none;
}

.premium-tabs::-webkit-scrollbar{
  display:none;
}

.premium-tabs__tab{
  display:inline-flex;
  align-items:center;
  gap:.6rem;
  flex:0 0 auto;
  min-height:48px;
  padding:.82rem 1rem;
  border:1px solid var(--ui-border);
  border-radius:var(--ui-radius-md);
  background:var(--ui-surface);
  color:var(--ui-text-strong);
  font-weight:700;
  white-space:nowrap;
  transition:transform var(--ui-motion-fast),box-shadow var(--ui-motion-fast),border-color var(--ui-motion-fast),background var(--ui-motion-fast),color var(--ui-motion-fast);
}

.premium-tabs__tab:hover{
  transform:translateY(-1px);
  box-shadow:var(--ui-shadow-sm);
  border-color:color-mix(in srgb,var(--ui-primary) 35%,var(--ui-border));
}

.premium-tabs__tab--active{
  background:linear-gradient(135deg,var(--ui-primary),color-mix(in srgb,var(--ui-primary) 72%,#2eb7c9));
  color:var(--ui-primary-contrast);
  border-color:transparent;
  box-shadow:var(--ui-shadow-md);
}

.premium-tabs__tab small{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-width:1.65rem;
  padding:.15rem .45rem;
  border-radius:999px;
  background:var(--ui-surface-muted);
  color:inherit;
  font-size:.74rem;
}

.premium-tabs__tab--active small{
  background:color-mix(in srgb,var(--ui-primary-contrast) 20%,transparent);
}

.premium-tabs__tab:focus-visible{
  outline:3px solid color-mix(in srgb,var(--ui-focus) 30%,transparent);
  outline-offset:3px;
}

@media (max-width: 1100px){
  .premium-tabs{
    justify-content:flex-start;
    padding-inline:0;
  }
}
</style>
