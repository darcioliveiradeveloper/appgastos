import mongoose from 'mongoose';

const investimentoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nome: { type: String, required: true }, // ex: Tesouro Direto, Ações PETR4
  tipo: { type: String, required: true }, // renda fixa, variável, cripto
  valorInvestido: { type: Number, required: true },
  valorAtual: { type: Number },
  dataAporte: { type: Date, default: Date.now },
  rentabilidade: { type: Number }
}, { timestamps: true });

export default mongoose.model('Investimento', investimentoSchema);
