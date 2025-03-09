class Disclosure {
  rootElement: HTMLElement;
  detailsElements: NodeListOf<HTMLElement>;
  summaryElements: NodeListOf<HTMLElement>;
  contentElements: NodeListOf<HTMLElement>;

  constructor(root: HTMLElement) {
    this.rootElement = root;
    let NOT_NESTED = ':not(:scope summary + * *)';
    this.detailsElements = this.rootElement.querySelectorAll(`details${NOT_NESTED}`);
    this.summaryElements = this.rootElement.querySelectorAll(`summary${NOT_NESTED}`);
    this.contentElements = this.rootElement.querySelectorAll(`summary${NOT_NESTED} + *`);
    if (!this.detailsElements.length || !this.summaryElements.length || !this.contentElements.length) return;
    this.initialize();
  }

  private initialize(): void {
    this.summaryElements.forEach(summary => {
      if (!this.isFocusable(summary.parentElement!)) {
        summary.setAttribute('tabindex', '-1');
        summary.style.setProperty('pointer-events', 'none');
      }
      summary.addEventListener('keydown', event => this.handleSummaryKeyDown(event));
    });
    this.contentElements.forEach(content => {
      if (!this.isFocusable(content.parentElement!)) content.setAttribute('hidden', '');
    });
    this.rootElement.setAttribute('data-disclosure-initialized', '');
  }

  private isFocusable(element: HTMLElement): boolean {
    return element.getAttribute('aria-disabled') !== 'true' && !element.hasAttribute('disabled');
  }

  private toggle(details: HTMLElement, isOpen: boolean): void {
    if (isOpen) {
      details.setAttribute('open', '');
    } else {
      details.removeAttribute('open');
    }
  }

  private handleSummaryKeyDown(event: KeyboardEvent): void {
    let { key } = event;
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(key)) return;
    event.preventDefault();
    let focusableSummaries = [...this.summaryElements].filter(summary => this.isFocusable(summary.parentElement!));
    let currentIndex = focusableSummaries.indexOf(document.activeElement as HTMLElement);
    let length = focusableSummaries.length;
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
    focusableSummaries[newIndex].focus();
  }

  open(details: HTMLElement): void {
    if (details.hasAttribute('open')) return;
    this.toggle(details, true);
  }

  close(details: HTMLElement): void {
    if (!details.hasAttribute('open')) return;
    this.toggle(details, false);
  }
}

export default Disclosure;
