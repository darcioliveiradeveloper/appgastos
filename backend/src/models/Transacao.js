import mongoose from 'mongoose';

const transacaoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tipo: { type: String, enum: ['receita', 'despesa', 'investimento'], required: true },
  categoria: { type: String, required: true }, // ex: Alimentação, Transporte, Salário
  descricao: { type: String },
  valor: { type: Number, required: true },
  data: { type: Date, default: Date.now },
  periodo: { type: String }, // ex: 09/12
  conta: { type: String, default: 'carteira' }, // carteira, cartão, etc
  pago: { type: Boolean, default: false },
  recorrente: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Transacao', transacaoSchema);
