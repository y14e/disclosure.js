class Disclosure {
  element: HTMLElement;
  summaries: NodeListOf<HTMLElement>;

  constructor(element: HTMLElement) {
    this.element = element;
    const NOT_NESTED = ':not(:scope summary + * *)';
    this.summaries = this.element.querySelectorAll(`summary${NOT_NESTED}`);
    this.initialize();
  }

  private initialize() {
    this.summaries.forEach(summary => {
      summary.addEventListener('click', e => {
        this.handleClick(e);
      });
      summary.addEventListener('keydown', e => {
        this.handleKeyDown(e);
      });
    });
  }

  private toggle(details: HTMLDetailsElement, isOpen: boolean) {
    details.dataset.disclosureTransitioning = '';
    const name = details.name;
    if (name) {
      details.removeAttribute('name');
      const opened = document.querySelector(`details[name="${name}"][open]`) as HTMLDetailsElement;
      if (isOpen && opened && opened !== details) {
        this.toggle(opened, false);
      }
    }
    if (isOpen) {
      details.open = true;
    } else {
      details.dataset.disclosureClosing = '';
    }
    const summary = details.querySelector('summary') as HTMLElement;
    const content = summary.nextElementSibling as HTMLElement;
    const height = `${content.scrollHeight}px`;
    content.addEventListener('transitionend', function once(e) {
      if (e.propertyName !== 'max-height') {
        return;
      }
      delete details.dataset.disclosureTransitioning;
      if (name) {
        details.name = name;
      }
      if (!isOpen) {
        details.open = false;
        delete details.dataset.disclosureClosing;
      }
      content.style.maxHeight = content.style.overflow = '';
      this.removeEventListener('transitionend', once);
    });
    content.style.maxHeight = isOpen ? '0' : height;
    content.style.overflow = 'clip';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        content.style.maxHeight = isOpen ? height : '0';
      });
    });
  }

  private handleClick(e: MouseEvent) {
    e.preventDefault();
    if (this.element.querySelector('[data-disclosure-transitioning]')) {
      return;
    }
    const detail = (e.currentTarget as HTMLElement).parentElement as HTMLDetailsElement;
    this.toggle(detail, !detail.open);
  }

  private handleKeyDown(e: KeyboardEvent) {
    const { key } = e;
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(key)) {
      return;
    }
    e.preventDefault();
    const index = [...this.summaries].indexOf(document.activeElement as HTMLElement);
    const length = this.summaries.length;
    this.summaries[key === 'ArrowUp' ? (index - 1 < 0 ? length - 1 : index - 1) : key === 'ArrowDown' ? (index + 1) % length : key === 'Home' ? 0 : length - 1].focus();
  }
}

export default Disclosure;
