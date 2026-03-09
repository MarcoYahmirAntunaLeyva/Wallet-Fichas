import { Inject, Injectable } from '@nestjs/common';
import type { IWalletRepository } from '../../domain/repositories/wallet.repository.interface';
import { WALLET_REPOSITORY } from '../../domain/repositories/wallet.repository.interface';
import { DepositChipsDto } from '../dtos/deposit-chips.dto';
import { WalletEntity } from '../../domain/entities/wallet.entity';
import { TransactionEntity } from '../../domain/entities/transaction.entity';

@Injectable()
export class DepositChipsUseCase {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
  ) {}

  async execute(dto: DepositChipsDto): Promise<WalletEntity> {
    // 1. Buscar o crear la wallet del usuario
    let wallet = await this.walletRepository.findByUserId(dto.userId);
    if (!wallet) {
      wallet = WalletEntity.create(dto.userId);
      wallet = await this.walletRepository.create(wallet);
    }

    // 2. Depositar dinero y convertir a fichas
    wallet.depositMoney(dto.moneyAmount);
    wallet.convertMoneyToChips(dto.moneyAmount);

    // 3. Guardar estado actualizado
    const updated = await this.walletRepository.update(wallet);

    // 4. Registrar transacción en historial
    const transaction = TransactionEntity.create(
      dto.userId,
      'CONVERT_TO_CHIPS',
      `Conversión de $${dto.moneyAmount} MXN a ${dto.moneyAmount * 10} fichas`,
      'chips',
      dto.moneyAmount * 10,
    );
    await this.walletRepository.saveTransaction(transaction);

    return updated;
  }
}
