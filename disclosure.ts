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
      summary.addEventListener('click', event => {
        this.handleClick(event);
      });
      summary.addEventListener('keydown', event => {
        this.handleKeyDown(event);
      });
    });
  }

  private state(details: HTMLDetailsElement, isOpen: boolean) {
    details.dataset.disclosureTransitioning = '';
    const name = details.name;
    if (name) {
      details.removeAttribute('name');
      const opened = document.querySelector(`details[name="${name}"][open]`) as HTMLDetailsElement;
      if (isOpen && opened && opened !== details) {
        this.close(opened);
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
    content.addEventListener('transitionend', function handleTransitionEnd(event: TransitionEvent) {
      if (event.propertyName !== 'max-height') {
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
      this.removeEventListener('transitionend', handleTransitionEnd);
    });
    content.style.cssText += `
      max-height: ${isOpen ? '0' : height};
      overflow: clip;
    `;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        content.style.maxHeight = isOpen ? height : '0';
      });
    });
  }

  private handleClick(event: MouseEvent) {
    event.preventDefault();
    if (this.element.querySelector('[data-disclosure-transitioning]')) {
      return;
    }
    this.toggle((event.currentTarget as HTMLElement).parentElement as HTMLDetailsElement);
  }

  private handleKeyDown(event: KeyboardEvent) {
    const { key } = event;
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(key)) {
      return;
    }
    event.preventDefault();
    const index = [...this.summaries].indexOf(document.activeElement as HTMLElement);
    const length = this.summaries.length;
    this.summaries[key === 'ArrowUp' ? (index - 1 < 0 ? length - 1 : index - 1) : key === 'ArrowDown' ? (index + 1) % length : key === 'Home' ? 0 : length - 1].focus();
  }

  open(details: HTMLDetailsElement) {
    this.state(details, true);
  }

  close(details: HTMLDetailsElement) {
    this.state(details, false);
  }

  toggle(details: HTMLDetailsElement) {
    this.state(details, !details.open);
  }
}

export default Disclosure;
