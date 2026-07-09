<template>
  <span class="school-mode-badge" :class="`school-mode-badge--${variant}`">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { labelForSchoolMode, type SchoolModeValue } from '../models/school-administration.model';

const props = defineProps<{
  mode: SchoolModeValue | string;
}>();

const label = computed(() => labelForSchoolMode(props.mode));
const variant = computed(() => {
  if (props.mode === 'OFFLINE_ONLY') return 'neutral';
  if (props.mode === 'SYNC') return 'success';
  return 'warning';
});
</script>

<style scoped>
.school-mode-badge{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  padding:.42rem .8rem;
  border-radius:999px;
  font-size:.82rem;
  font-weight:700;
  letter-spacing:.01em;
}

.school-mode-badge--neutral{
  background:rgba(90,114,133,.12);
  color:#445b70;
}

.school-mode-badge--success{
  background:rgba(25,163,100,.12);
  color:#147448;
}

.school-mode-badge--warning{
  background:rgba(212,139,18,.12);
  color:#9c6908;
}
</style>

