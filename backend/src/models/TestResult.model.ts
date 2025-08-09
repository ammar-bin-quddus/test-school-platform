import mongoose, { Document, Schema } from 'mongoose';

export interface ITestResult extends Document {
  userId: mongoose.Types.ObjectId;
  step: 1 | 2 | 3;
  scorePercent: number;
  certifiedLevel: string | null;
  pass: boolean;
  createdAt: Date;
  updatedAt: Date;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
}

const TestResultSchema = new Schema<ITestResult>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  step: { type: Number, enum: [1, 2, 3], required: true },
  scorePercent: { type: Number, required: true },
  certifiedLevel: { type: String, default: null },
  pass: { type: Boolean, required: true },
  startTime: { type: Date, required: true, default: Date.now },
  endTime: { type: Date, required: false },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<ITestResult>('TestResult', TestResultSchema);
