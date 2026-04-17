import { Injectable, Inject } from '@nestjs/common';
import { Firestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { IHistoryRepository } from '../../domain/repositories/history.repository.interface';
import { GameRecord } from '../../domain/entities/game-record.entity';
import { FIRESTORE } from '../../../wallet/infrastructure/repositories/wallet.repository';

@Injectable()
export class FirebaseHistoryRepository implements IHistoryRepository {
  constructor(@Inject(FIRESTORE) private readonly db: Firestore) {}

  async save(record: GameRecord): Promise<void> {
    await addDoc(collection(this.db, 'gameHistory'), {
      id:        record.id,
      userId:    record.userId,
      game:      record.game,
      betAmount: record.betAmount,
      winAmount: record.winAmount,
      detail:    record.detail,
      timestamp: record.timestamp.toISOString(),
    });
  }

  async findByUserId(userId: string): Promise<GameRecord[]> {
    const q = query(collection(this.db, 'gameHistory'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs
      .map(d => {
        const data = d.data();
        return new GameRecord(
          data.id,
          data.userId,
          data.game,
          data.betAmount,
          data.winAmount,
          data.detail,
          new Date(data.timestamp),
        );
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}
