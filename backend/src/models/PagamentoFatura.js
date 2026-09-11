import mongoose from 'mongoose';
const pagamentoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cartao: { type: String, required: true },
  cartaoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cartao' },
  valor: { type: Number, required: true },
  data: { type: Date, default: Date.now }
}, { timestamps: true });
export default mongoose.model('PagamentoFatura', pagamentoSchema);
