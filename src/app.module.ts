import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletModule } from './wallet/wallet.module';
import { AppModule1 } from './Juegos/cmd/app.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [WalletModule, AppModule1, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

