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
  border:1px solid rgba(17,40,63,.1);
  border-radius:18px;
  background:#fff;
  color:#173347;
  font-weight:700;
  white-space:nowrap;
  transition:transform .2s ease, box-shadow .2s ease, border-color .2s ease, background .2s ease, color .2s ease;
}

.premium-tabs__tab:hover{
  transform:translateY(-1px);
  box-shadow:0 16px 30px rgba(17,40,63,.08);
  border-color:rgba(11,93,122,.18);
}

.premium-tabs__tab--active{
  background:linear-gradient(135deg,#0b5d7a,#1487a8);
  color:#fff;
  border-color:transparent;
  box-shadow:0 18px 34px rgba(11,93,122,.24);
}

.premium-tabs__tab small{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-width:1.65rem;
  padding:.15rem .45rem;
  border-radius:999px;
  background:rgba(17,40,63,.08);
  color:inherit;
  font-size:.74rem;
}

.premium-tabs__tab--active small{
  background:rgba(255,255,255,.2);
}

.premium-tabs__tab:focus-visible{
  outline:3px solid rgba(20,135,168,.22);
  outline-offset:3px;
}

@media (max-width: 1100px){
  .premium-tabs{
    justify-content:flex-start;
    padding-inline:0;
  }
}
</style>
