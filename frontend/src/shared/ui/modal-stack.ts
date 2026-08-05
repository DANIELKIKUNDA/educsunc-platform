let activeLocks = 0;
let originalOverflow = '';

export function acquireBodyScrollLock(): () => void {
  if (activeLocks === 0) {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  activeLocks += 1;
  let released = false;

  return () => {
    if (released) return;
    released = true;
    activeLocks = Math.max(0, activeLocks - 1);

    if (activeLocks === 0) {
      document.body.style.overflow = originalOverflow;
      originalOverflow = '';
    }
  };
}
