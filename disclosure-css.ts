class Disclosure {
  element: HTMLElement;
  summaries: NodeListOf<HTMLElement>;

  constructor(element: HTMLElement) {
    this.element = element;
    const NOT_NESTED = ':not(:scope summary + * *)';
    this.summaries = this.element.querySelectorAll(`summary${NOT_NESTED}:not([aria-disabled="true"])`);
    this.initialize();
  }

  private initialize(): void {
    this.summaries.forEach(summary => summary.addEventListener('keydown', event => this.handleKeyDown(event)));
  }

  private state(details: HTMLDetailsElement, isOpen: boolean): void {
    details.open = isOpen;
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
    this.state(details, true);
  }

  close(details: HTMLDetailsElement): void {
    this.state(details, false);
  }

  toggle(details: HTMLDetailsElement): void {
    this.state(details, !details.open);
  }
}

export default Disclosure;
