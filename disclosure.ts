type DisclosureOptions = {
  animation?: {
    duration?: number;
    easing?: string;
  };
};

class Disclosure {
  element: HTMLElement;
  options: Required<DisclosureOptions>;
  summaries: NodeListOf<HTMLElement>;

  constructor(element: HTMLElement, options?: DisclosureOptions) {
    this.element = element;
    this.options = {
      animation: {
        duration: 300,
        easing: 'ease',
        ...options?.animation,
      },
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.options.animation.duration = 0;
    }
    const NOT_NESTED = ':not(:scope summary + * *)';
    this.summaries = this.element.querySelectorAll(`summary${NOT_NESTED}:not([aria-disabled="true"])`);
    this.initialize();
  }

  private initialize() {
    this.summaries.forEach(summary => {
      summary.addEventListener('click', event => this.handleClick(event));
      summary.addEventListener('keydown', event => this.handleKeyDown(event));
    });
  }

  private state(details: HTMLDetailsElement, isOpen: boolean) {
    const element = this.element;
    element.dataset.disclosureAnimating = '';
    const name = details.name;
    if (name) {
      details.removeAttribute('name');
      const opened = document.querySelector(`details[name="${name}"][open]`) as HTMLDetailsElement;
      if (isOpen && opened && opened !== details) this.close(opened);
    }
    if (isOpen) {
      details.open = true;
    } else {
      details.dataset.disclosureClosing = '';
    }
    const summary = details.querySelector('summary') as HTMLElement;
    const content = summary.nextElementSibling as HTMLElement;
    const height = `${content.scrollHeight}px`;
    content.style.cssText += `
      overflow: clip;
      will-change: max-height;
    `;
    content.animate({ maxHeight: [isOpen ? '0' : height, isOpen ? height : '0'] }, { duration: this.options.animation.duration, easing: this.options.animation.easing }).addEventListener('finish', () => {
      delete element.dataset.disclosureAnimating;
      if (name) details.name = name;
      if (!isOpen) {
        details.open = false;
        delete details.dataset.disclosureClosing;
      }
      content.style.maxHeight = content.style.overflow = content.style.willChange = '';
    });
  }

  private handleClick(event: MouseEvent) {
    event.preventDefault();
    if (this.element.hasAttribute('data-disclosure-animating')) return;
    this.toggle((event.currentTarget as HTMLElement).parentElement as HTMLDetailsElement);
  }

  private handleKeyDown(event: KeyboardEvent) {
    const { key } = event;
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(key)) return;
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
