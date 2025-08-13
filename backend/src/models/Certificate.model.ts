import mongoose, { Document, Schema } from 'mongoose';

export interface ICertificate extends Document {
  userId: mongoose.Types.ObjectId;
  testResultId?: mongoose.Types.ObjectId;
  level: string;
  filePath: string;
  issuedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  testResultId: { type: Schema.Types.ObjectId, ref: 'TestResult' },
  level: { type: String, required: true },
  filePath: { type: String, required: true },
  issuedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICertificate>('Certificate', CertificateSchema);
