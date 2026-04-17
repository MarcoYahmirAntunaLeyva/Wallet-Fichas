import { Injectable, Inject } from '@nestjs/common';
import type { IHistoryRepository } from '../../domain/repositories/history.repository.interface';
import { HISTORY_REPOSITORY } from '../../domain/repositories/history.repository.interface';
import { GameRecord } from '../../domain/entities/game-record.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class SaveRecordUseCase {
  constructor(
    @Inject(HISTORY_REPOSITORY)
    private readonly repo: IHistoryRepository,
  ) {}

  async execute(
    userId: string,
    game: string,
    betAmount: number,
    winAmount: number,
    detail: string,
  ): Promise<void> {
    const record = new GameRecord(
      randomUUID(),
      userId,
      game,
      betAmount,
      winAmount,
      detail,
      new Date(),
    );
    await this.repo.save(record);
  }
}
