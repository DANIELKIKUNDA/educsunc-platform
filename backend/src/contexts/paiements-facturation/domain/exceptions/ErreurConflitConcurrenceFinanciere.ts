export class ErreurConflitConcurrenceFinanciere extends Error {
  constructor(message = 'Un conflit de concurrence financiere a ete detecte.') {
    super(message);
    this.name = 'ErreurConflitConcurrenceFinanciere';
  }
}
