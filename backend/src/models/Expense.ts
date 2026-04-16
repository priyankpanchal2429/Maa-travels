import mongoose, { Document, Schema } from 'mongoose';

export type ExpenseType = 'daily' | 'maintenance' | 'fuel' | 'other';

export interface IExpense extends Document {
  collegeId: mongoose.Types.ObjectId;
  type: ExpenseType;
  amount: number;
  date: Date;
  description: string;
  busId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
    type: {
      type: String,
      enum: ['daily', 'maintenance', 'fuel', 'other'],
      required: true,
    },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    description: { type: String, required: true, trim: true },
    busId: { type: Schema.Types.ObjectId, ref: 'Bus' },
  },
  { timestamps: true, versionKey: false }
);

export const Expense = mongoose.model<IExpense>('Expense', expenseSchema);
