class Disclosure {
  constructor(element) {
    this.element = element;
    const NOT_NESTED = ':not(:scope summary + * *)';
    this.summaries = this.element.querySelectorAll(`summary${NOT_NESTED}`);
    this.initialize();
  }
  initialize() {
    this.summaries.forEach(summary => {
      summary.addEventListener('click', event => {
        this.click(event);
      });
      summary.addEventListener('keydown', event => {
        this.keydown(event);
      });
    });
  }
  toggle(detail, open) {
    detail.dataset.disclosureTransitioning = '';
    const name = detail.name;
    if (name) {
      detail.removeAttribute('name');
      const opened = document.querySelector(`details[name="${name}"][open]`);
      if (open && opened && opened !== detail) {
        this.toggle(opened, false);
      }
    }
    if (open) {
      detail.open = true;
    } else {
      detail.dataset.disclosureClosing = '';
    }
    const summary = detail.querySelector('summary');
    const content = summary.nextElementSibling;
    const height = `${content.scrollHeight}px`;
    content.addEventListener('transitionend', function once(event) {
      if (event.propertyName !== 'max-height') {
        return;
      }
      delete detail.dataset.disclosureTransitioning;
      if (name) {
        detail.name = name;
      }
      if (!open) {
        detail.open = false;
        delete detail.dataset.disclosureClosing;
      }
      content.style.maxHeight = content.style.overflow = '';
      this.removeEventListener('transitionend', once);
    });
    content.style.maxHeight = open ? 0 : height;
    content.style.overflow = 'clip';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        content.style.maxHeight = open ? height : 0;
      });
    });
  }
  click(event) {
    event.preventDefault();
    if (this.element.querySelector('[data-disclosure-transitioning]')) {
      return;
    }
    const detail = event.currentTarget.parentElement;
    this.toggle(detail, !detail.open);
  }
  keydown(event) {
    const key = event.key;
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(key)) {
      return;
    }
    event.preventDefault();
    const index = [...this.summaries].indexOf(document.activeElement);
    const length = this.summaries.length;
    this.summaries[key === 'ArrowUp' ? (index - 1 < 0 ? length - 1 : index - 1) : key === 'ArrowDown' ? (index + 1) % length : key === 'Home' ? 0 : length - 1].focus();
  }
}

export default Disclosure;