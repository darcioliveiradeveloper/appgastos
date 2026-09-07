import mongoose from 'mongoose';

const codigoSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true, uppercase: true },
  criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  usado: { type: Boolean, default: false },
  usadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  usadoEm: { type: Date },
  expiraEm: { type: Date, default: () => new Date(Date.now() + 30*24*60*60*1000) } // 30 dias
}, { timestamps: true });

export default mongoose.model('CodigoAtivacao', codigoSchema);
