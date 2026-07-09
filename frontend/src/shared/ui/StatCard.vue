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
  border:1px solid rgba(17,40,63,.08);
  border-radius:24px;
  background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(247,250,255,.95));
  box-shadow:0 18px 42px rgba(17,40,63,.08);
  text-align:left;
  transition:transform .22s ease, box-shadow .22s ease, border-color .22s ease, background .22s ease;
}

.stat-card--clickable{
  cursor:pointer;
}

.stat-card--clickable:hover{
  transform:translateY(-2px);
  box-shadow:0 24px 48px rgba(17,40,63,.12);
  border-color:rgba(11,93,122,.2);
}

.stat-card--selected{
  border-color:rgba(11,93,122,.26);
  box-shadow:0 24px 50px rgba(11,93,122,.16);
}

.stat-card:focus-visible{
  outline:3px solid rgba(20,135,168,.22);
  outline-offset:3px;
}

.stat-card__icon{
  display:grid;
  place-items:center;
  width:3rem;
  height:3rem;
  border-radius:18px;
  color:#fff;
  box-shadow:0 12px 28px rgba(17,40,63,.18);
}

.stat-card__icon--primary{
  background:linear-gradient(135deg,#0b5d7a,#1b86a7);
}

.stat-card__icon--success{
  background:linear-gradient(135deg,#18794e,#23a36d);
}

.stat-card__icon--warning{
  background:linear-gradient(135deg,#915f08,#d48b12);
}

.stat-card__icon--neutral{
  background:linear-gradient(135deg,#34475f,#5a7285);
}

.stat-card__content{
  display:grid;
  align-content:start;
  gap:.28rem;
  min-width:0;
}

.stat-card__content small{
  color:#6b8294;
  font-size:.76rem;
  text-transform:uppercase;
  letter-spacing:.08em;
}

.stat-card__content strong{
  color:#10243b;
  font-size:1.9rem;
  line-height:1;
  letter-spacing:-.02em;
}

.stat-card__content span{
  color:#5a7285;
  line-height:1.45;
}

@media (max-width: 720px){
  .stat-card{
    min-height:144px;
  }
}
</style>
