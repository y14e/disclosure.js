// disclosure (css) [20241219]
const initializeDisclosure = a => {
  const b = a.querySelectorAll('summary:not(:scope [data-disclosure] *)');
  b.forEach(c => {
    c.addEventListener('keydown', a => {
      const c = a.key;
      if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(c)) {
        return;
      }
      a.preventDefault();
      const d = [...b].indexOf(document.activeElement);
      const e = b.length;
      const f = b[c === 'ArrowUp' ? d - 1 < 0 ? e - 1 : d - 1 : c === 'ArrowDown' ? (d + 1) % e : c === 'Home' ? 0 : e - 1];
      f.focus();
    });
  });
};
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-disclosure]').forEach(a => {
    initializeDisclosure(a);
  });
});