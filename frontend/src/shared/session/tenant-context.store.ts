import { reactive, watchEffect } from 'vue';
import { sessionStore } from '../auth/session.store';
import { activeContextStore } from './active-context.store';

export interface TenantContextState {
  organizationId: string;
  schoolId: string;
  userId: string;
}

const state = reactive<TenantContextState>({
  organizationId: '',
  schoolId: '',
  userId: '',
});

watchEffect(() => {
  state.organizationId = activeContextStore.state.organizationId;
  state.schoolId = activeContextStore.state.schoolId;
  state.userId = sessionStore.state.userId;
});

export const tenantContextStore = {
  state,
};
