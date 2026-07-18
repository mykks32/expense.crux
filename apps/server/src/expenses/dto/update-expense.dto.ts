import { UpdateExpenseInput } from '@mykks32/expense-crux-contracts';
import { PartialType } from '@nestjs/mapped-types';
import { CreateExpenseDto } from './create-expense.dto';

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) implements UpdateExpenseInput {}
