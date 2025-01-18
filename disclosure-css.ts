class Disclosure {
  element: HTMLElement;
  summaries: NodeListOf<HTMLElement>;

  constructor(element: HTMLElement) {
    this.element = element;
    const NOT_NESTED = ':not(:scope summary + * *)';
    this.summaries = this.element.querySelectorAll(`summary${NOT_NESTED}`);
    this.initialize();
  }

  private initialize(): void {
    this.summaries.forEach(summary => {
      summary.addEventListener('keydown', e => {
        this.handleKeyDown(e);
      });
    });
  }

  private handleKeyDown(e: KeyboardEvent): void {
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
