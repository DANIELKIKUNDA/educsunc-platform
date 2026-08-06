<template>
  <component
    :is="clickable ? 'button' : 'article'"
    class="stat-card"
    :class="{
      'stat-card--clickable': clickable,
      'stat-card--selected': selected,
    }"
    :type="clickable ? 'button' : undefined"
    :aria-label="ariaLabel ?? label"
    @click="handleClick"
  >
    <div class="stat-card__icon" :class="`stat-card__icon--${tone}`">
      <component :is="icon" :size="20" />
    </div>
    <div class="stat-card__content">
      <small>{{ label }}</small>
      <strong>{{ value }}</strong>
      <span>{{ hint }}</span>
    </div>
  </component>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

const props = withDefaults(defineProps<{
  icon: Component;
  label: string;
  value: string | number;
  hint: string;
  tone?: 'primary' | 'success' | 'warning' | 'neutral';
  clickable?: boolean;
  selected?: boolean;
  ariaLabel?: string;
}>(), {
  tone: 'primary',
  clickable: false,
  selected: false,
  ariaLabel: undefined,
});

const emit = defineEmits<{
  click: [];
}>();

function handleClick(): void {
  if (!props.clickable) {
    return;
  }

  emit('click');
}
</script>

<style scoped>
.stat-card{
  display:grid;
  grid-template-columns:auto minmax(0,1fr);
  gap:1rem;
  align-items:start;
  width:100%;
  min-height:158px;
  padding:1.15rem 1.15rem 1.1rem;
  border:1px solid var(--ui-border);
  border-radius:var(--ui-radius-lg);
  background:linear-gradient(180deg,var(--ui-surface),var(--ui-surface-subtle));
  box-shadow:var(--ui-shadow-md);
  text-align:left;
  transition:transform var(--ui-motion-standard),box-shadow var(--ui-motion-standard),border-color var(--ui-motion-standard),background var(--ui-motion-standard);
}

.stat-card--clickable{
  cursor:pointer;
}

.stat-card--clickable:hover{
  transform:translateY(-2px);
  box-shadow:var(--ui-shadow-lg);
  border-color:color-mix(in srgb,var(--ui-primary) 35%,var(--ui-border));
}

.stat-card--selected{
  border-color:color-mix(in srgb,var(--ui-primary) 48%,var(--ui-border));
  box-shadow:var(--ui-shadow-lg);
}

.stat-card:focus-visible{
  outline:3px solid color-mix(in srgb,var(--ui-focus) 30%,transparent);
  outline-offset:3px;
}

.stat-card__icon{
  display:grid;
  place-items:center;
  width:3rem;
  height:3rem;
  border-radius:18px;
  color:#fff;
  box-shadow:var(--ui-shadow-sm);
}

.stat-card__icon--primary{
  background:linear-gradient(135deg,var(--ui-primary),color-mix(in srgb,var(--ui-primary) 68%,#2eb7c9));
}

.stat-card__icon--success{
  background:linear-gradient(135deg,var(--ui-success),color-mix(in srgb,var(--ui-success) 72%,#34d399));
}

.stat-card__icon--warning{
  background:linear-gradient(135deg,var(--ui-warning),color-mix(in srgb,var(--ui-warning) 72%,#f4b942));
}

.stat-card__icon--neutral{
  background:linear-gradient(135deg,var(--ui-text),var(--ui-text-muted));
}

.stat-card__content{
  display:grid;
  align-content:start;
  gap:.28rem;
  min-width:0;
}

.stat-card__content small{
  color:var(--ui-text-muted);
  font-size:.76rem;
  text-transform:uppercase;
  letter-spacing:.08em;
}

.stat-card__content strong{
  color:var(--ui-text-strong);
  font-size:1.9rem;
  line-height:1;
  letter-spacing:-.02em;
}

.stat-card__content span{
  color:var(--ui-text-muted);
  line-height:1.45;
}

@media (max-width: 720px){
  .stat-card{
    min-height:144px;
  }
}
</style>
