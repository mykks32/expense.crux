import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Expense extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ trim: true })
  category?: string;

  @Prop({ default: () => new Date() })
  date: Date;

  @Prop({ trim: true })
  notes?: string;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
