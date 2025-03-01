type DisclosureOptions = {
  animation: {
    duration: number;
    easing: string;
  };
};

class Disclosure {
  root: HTMLElement;
  defaults: DisclosureOptions;
  settings: DisclosureOptions;
  details: NodeListOf<HTMLElement>;
  summaries: NodeListOf<HTMLElement>;
  contents: NodeListOf<HTMLElement>;

  constructor(root: HTMLElement, options?: Partial<DisclosureOptions>) {
    this.root = root;
    this.defaults = {
      animation: {
        duration: 300,
        easing: 'ease',
      },
    };
    this.settings = {
      animation: { ...this.defaults.animation, ...options?.animation },
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) this.settings.animation.duration = 0;
    const NOT_NESTED = ':not(:scope summary + * *)';
    this.details = this.root.querySelectorAll(`details${NOT_NESTED}`);
    this.summaries = this.root.querySelectorAll(`summary${NOT_NESTED}`);
    this.contents = this.root.querySelectorAll(`summary${NOT_NESTED} + *`);
    if (!this.details.length || !this.details.length || !this.contents.length) return;
    this.initialize();
  }

  private initialize(): void {
    this.summaries.forEach(summary => {
      summary.addEventListener('click', event => this.handleClick(event));
      summary.addEventListener('keydown', event => this.handleKeyDown(event));
    });
    this.root.setAttribute('data-disclosure-initialized', '');
  }

  private toggle(details: HTMLDetailsElement, isOpen: boolean): void {
    const root = this.root;
    root.setAttribute('data-disclosure-animating', '');
    const name = details.getAttribute('name');
    if (name) {
      details.removeAttribute('name');
      const opened = document.querySelector(`details[name="${name}"][open]`) as HTMLDetailsElement;
      if (isOpen && opened && opened !== details) this.close(opened);
    }
    if (isOpen) {
      details.setAttribute('open', '');
    } else {
      details.setAttribute('data-disclosure-closing', '');
    }
    details.style.setProperty('overflow', 'clip');
    details.style.setProperty('will-change', [...new Set(window.getComputedStyle(details).getPropertyValue('will-change').split(',')).add('height').values()].filter(value => value !== 'auto').join(','));
    const summary = details.querySelector('summary');
    const min = `${summary!.scrollHeight}px`;
    const max = `${parseInt(min) + summary!.nextElementSibling!.scrollHeight}px`;
    details.animate({ height: isOpen ? [min, max] : [max, min] }, { duration: this.settings.animation.duration, easing: this.settings.animation.easing }).addEventListener('finish', () => {
      root.removeAttribute('data-disclosure-animating');
      if (name) details.setAttribute('name', name);
      if (!isOpen) {
        details.removeAttribute('open');
        details.removeAttribute('data-disclosure-closing');
      }
      ['height', 'overflow', 'will-change'].forEach(name => details.style.removeProperty(name));
    });
  }

  private handleClick(event: MouseEvent): void {
    event.preventDefault();
    if (this.root.hasAttribute('data-disclosure-animating')) return;
    const details = (event.currentTarget as HTMLElement).parentElement as HTMLDetailsElement;
    this.toggle(details, !details.hasAttribute('open'));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const { key } = event;
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(key)) return;
    event.preventDefault();
    const focusables = [...this.summaries].filter(summary => !summary.hasAttribute('aria-disabled'));
    const currentIndex = focusables.indexOf(document.activeElement as HTMLElement);
    const length = focusables.length;
    let newIndex = currentIndex;
    switch (key) {
      case 'ArrowUp':
        newIndex = (currentIndex - 1 + length) % length;
        break;
      case 'ArrowDown':
        newIndex = (currentIndex + 1) % length;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = length - 1;
        break;
    }
    focusables[newIndex].focus();
  }

  open(details: HTMLDetailsElement): void {
    this.toggle(details, true);
  }

  close(details: HTMLDetailsElement): void {
    this.toggle(details, false);
  }
}

export default Disclosure;
