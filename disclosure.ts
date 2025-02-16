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

  private initialize(): void {
    this.summaries.forEach(summary => {
      summary.addEventListener('click', event => this.handleClick(event));
      summary.addEventListener('keydown', event => this.handleKeyDown(event));
    });
  }

  private toggle(details: HTMLDetailsElement, isOpen: boolean): void {
    const element = this.element;
    element.setAttribute('data-disclosure-animating', '');
    const name = details.name;
    if (name) {
      details.removeAttribute('name');
      const opened = document.querySelector(`details[name="${name}"][open]`) as HTMLDetailsElement;
      if (isOpen && opened && opened !== details) this.close(opened);
    }
    if (isOpen) {
      details.open = true;
    } else {
      details.setAttribute('data-disclosure-closing', '');
    }
    const summary = details.querySelector('summary') as HTMLElement;
    const content = summary.nextElementSibling as HTMLElement;
    const height = `${content.scrollHeight}px`;
    content.style.cssText += `
      overflow: clip;
      will-change: ${[...new Set(window.getComputedStyle(content).getPropertyValue('will-change').split(',')).add('max-height').values()].filter(value => value !== 'auto').join(',')};
    `;
    content.animate({ maxHeight: [isOpen ? '0' : height, isOpen ? height : '0'] }, { duration: this.options.animation.duration, easing: this.options.animation.easing }).addEventListener('finish', () => {
      element.removeAttribute('data-disclosure-animating');
      if (name) details.name = name;
      if (!isOpen) {
        details.open = false;
        details.removeAttribute('data-disclosure-closing');
      }
      content.style.maxHeight = content.style.overflow = content.style.willChange = '';
    });
  }

  private handleClick(event: MouseEvent): void {
    event.preventDefault();
    if (this.element.hasAttribute('data-disclosure-animating')) return;
    const details = (event.currentTarget as HTMLElement).parentElement as HTMLDetailsElement;
    this.toggle(details, !details.open);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const { key } = event;
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(key)) return;
    event.preventDefault();
    const index = [...this.summaries].indexOf(document.activeElement as HTMLElement);
    const length = this.summaries.length;
    this.summaries[key === 'ArrowUp' ? (index - 1 < 0 ? length - 1 : index - 1) : key === 'ArrowDown' ? (index + 1) % length : key === 'Home' ? 0 : length - 1].focus();
  }

  open(details: HTMLDetailsElement): void {
    this.toggle(details, true);
  }

  close(details: HTMLDetailsElement): void {
    this.toggle(details, false);
  }
}

export default Disclosure;
