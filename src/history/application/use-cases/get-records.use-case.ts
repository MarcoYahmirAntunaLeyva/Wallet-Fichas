import { Injectable, Inject } from '@nestjs/common';
import type { IHistoryRepository } from '../../domain/repositories/history.repository.interface';
import { HISTORY_REPOSITORY } from '../../domain/repositories/history.repository.interface';
import { GameRecord } from '../../domain/entities/game-record.entity';

@Injectable()
export class GetRecordsUseCase {
  constructor(
    @Inject(HISTORY_REPOSITORY)
    private readonly repo: IHistoryRepository,
  ) {}

  async execute(userId: string): Promise<GameRecord[]> {
    return this.repo.findByUserId(userId);
  }
}
