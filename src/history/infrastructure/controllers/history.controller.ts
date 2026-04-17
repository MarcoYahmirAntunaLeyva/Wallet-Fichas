import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { SaveRecordUseCase } from '../../application/use-cases/save-record.use-case';
import { GetRecordsUseCase } from '../../application/use-cases/get-records.use-case';
import { JwtAuthGuard } from '../../../auth/infraestructure/guards/jwt-auth.guard';

@Controller('history')
export class HistoryController {
  constructor(
    private readonly saveRecord: SaveRecordUseCase,
    private readonly getRecords: GetRecordsUseCase,
  ) {}

  @Post()
  async save(@Body() body: {
    userId: string;
    game: string;
    betAmount: number;
    winAmount: number;
    detail: string;
  }) {
    await this.saveRecord.execute(
      body.userId,
      body.game,
      body.betAmount,
      body.winAmount,
      body.detail,
    );
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async getByUser(@Param('userId') userId: string) {
    return this.getRecords.execute(userId);
  }
}
