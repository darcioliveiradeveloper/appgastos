import mongoose from 'mongoose';
const cartaoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nome: { type: String, required: true },
  limite: { type: Number, default: 0 },
  vencimento: { type: Number, default: 10 }, // dia
  cor: { type: String, default: '#4f46e5' }
}, { timestamps: true });
export default mongoose.model('Cartao', cartaoSchema);
