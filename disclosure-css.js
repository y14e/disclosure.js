class Disclosure {
  constructor(element) {
    this.element = element;
    const NOT_NESTED = ':not(:scope summary + * *)';
    this.summaries = this.element.querySelectorAll(`summary${NOT_NESTED}`);
    this.initialize();
  }

  initialize() {
    this.summaries.forEach(summary => {
      summary.addEventListener('keydown', e => {
        this.handleKeyDown(e);
      });
    });
  }

  state(details, isOpen) {
    details.open = isOpen;
  }

  handleKeyDown(e) {
    const { key } = e;
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(key)) {
      return;
    }
    e.preventDefault();
    const index = [...this.summaries].indexOf(document.activeElement);
    const length = this.summaries.length;
    this.summaries[key === 'ArrowUp' ? (index - 1 < 0 ? length - 1 : index - 1) : key === 'ArrowDown' ? (index + 1) % length : key === 'Home' ? 0 : length - 1].focus();
  }

  open(details) {
    this.state(details, true);
  }

  close(details) {
    this.state(details, false);
  }

  toggle(details) {
    this.state(details, !details.open);
  }
}

export default Disclosure;
