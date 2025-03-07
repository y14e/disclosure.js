class Disclosure {
  root: HTMLElement;
  detailses: NodeListOf<HTMLElement>;
  summaries: NodeListOf<HTMLElement>;
  contents: NodeListOf<HTMLElement>;

  constructor(root: HTMLElement) {
    this.root = root;
    const NOT_NESTED = ':not(:scope summary + * *)';
    this.detailses = this.root.querySelectorAll(`details${NOT_NESTED}`);
    this.summaries = this.root.querySelectorAll(`summary${NOT_NESTED}`);
    this.contents = this.root.querySelectorAll(`summary${NOT_NESTED} + *`);
    if (!this.detailses.length || !this.summaries.length || !this.contents.length) return;
    this.initialize();
  }

  private initialize(): void {
    this.summaries.forEach(summary => summary.addEventListener('keydown', event => this.handleSummaryKeyDown(event)));
    this.root.setAttribute('data-disclosure-initialized', '');
  }

  private toggle(details: HTMLDetailsElement, isOpen: boolean): void {
    if (details.hasAttribute('open') === isOpen) return;
    if (isOpen) {
      details.setAttribute('open', '');
    } else {
      details.removeAttribute('open');
    }
  }

  private handleSummaryKeyDown(event: KeyboardEvent): void {
    const { key } = event;
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(key)) return;
    event.preventDefault();
    const nonDisabledSummaries = [...this.summaries].filter(summary => summary.getAttribute('aria-disabled') !== 'true');
    const currentIndex = nonDisabledSummaries.indexOf(document.activeElement as HTMLElement);
    const length = nonDisabledSummaries.length;
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
    nonDisabledSummaries[newIndex].focus();
  }

  open(details: HTMLDetailsElement): void {
    this.toggle(details, true);
  }

  close(details: HTMLDetailsElement): void {
    this.toggle(details, false);
  }
}

export default Disclosure;
