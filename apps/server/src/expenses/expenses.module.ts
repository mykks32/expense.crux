import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ExpensesController } from './controller/expenses.controller';
import { ExpensesService } from './service/expenses.service';
import { Expense, ExpenseSchema } from './entities/expense.entity';
import { ExpenseRepository } from './repositories/expense.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Expense.name, schema: ExpenseSchema }]), AuthModule],
  controllers: [ExpensesController],
  providers: [ExpensesService, ExpenseRepository],
})
export class ExpensesModule {}
