export class GameRecord {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly game: string,
    public readonly betAmount: number,
    public readonly winAmount: number,
    public readonly detail: string,
    public readonly timestamp: Date,
  ) {}

  get isWin(): boolean {
    return this.winAmount > 0;
  }
}
