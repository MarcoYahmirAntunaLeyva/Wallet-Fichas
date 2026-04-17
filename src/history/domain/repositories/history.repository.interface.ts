import { GameRecord } from '../entities/game-record.entity';

export interface IHistoryRepository {
  save(record: GameRecord): Promise<void>;
  findByUserId(userId: string): Promise<GameRecord[]>;
}

export const HISTORY_REPOSITORY = Symbol('IHistoryRepository');
