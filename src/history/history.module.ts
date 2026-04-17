import { Module } from '@nestjs/common';
import { getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { AuthModule } from '../auth/auth.module';
import { FIRESTORE } from '../wallet/infrastructure/repositories/wallet.repository';
import { HISTORY_REPOSITORY } from './domain/repositories/history.repository.interface';
import { FirebaseHistoryRepository } from './infrastructure/repositories/firebase-history.repository';
import { SaveRecordUseCase } from './application/use-cases/save-record.use-case';
import { GetRecordsUseCase } from './application/use-cases/get-records.use-case';
import { HistoryController } from './infrastructure/controllers/history.controller';

const FirestoreProvider = {
  provide: FIRESTORE,
  useFactory: () => getFirestore(getApp()),
};

@Module({
  imports: [AuthModule],
  controllers: [HistoryController],
  providers: [
    FirestoreProvider,
    FirebaseHistoryRepository,
    {
      provide: HISTORY_REPOSITORY,
      useClass: FirebaseHistoryRepository,
    },
    SaveRecordUseCase,
    GetRecordsUseCase,
  ],
})
export class HistoryModule {}
