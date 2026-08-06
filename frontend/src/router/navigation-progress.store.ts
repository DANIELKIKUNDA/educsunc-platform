import { reactive, readonly } from 'vue';

const DISPLAY_DELAY_MS = 160;

const mutableState = reactive({
  visible: false,
});

let displayTimer: ReturnType<typeof setTimeout> | null = null;

function begin(): void {
  if (displayTimer) clearTimeout(displayTimer);
  mutableState.visible = false;
  displayTimer = setTimeout(() => {
    mutableState.visible = true;
    displayTimer = null;
  }, DISPLAY_DELAY_MS);
}

function complete(): void {
  if (displayTimer) {
    clearTimeout(displayTimer);
    displayTimer = null;
  }
  mutableState.visible = false;
}

export const navigationProgressStore = {
  state: readonly(mutableState),
  begin,
  complete,
};
