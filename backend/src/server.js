import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import transacoesRoutes from './routes/transacoes.js';
import investimentosRoutes from './routes/investimentos.js';

dotenv.config();
const app = express();

// CORS prod: libere Vercel + local
const allowed = (process.env.FRONTEND_URL || '').split(',').map(s=>s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.length===0 || allowed.includes(origin) || allowed.includes('*')) return cb(null, true);
    // permite qualquer vercel.app em prod se não configurado
    if (origin.endsWith('.vercel.app')) return cb(null, true);
    cb(null, true); // aberto para MVP pessoal
  },
  credentials: true
}));
app.use(express.json());

await connectDB();

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));
app.use('/api/auth', authRoutes);
app.use('/api/transacoes', transacoesRoutes);
app.use('/api/investimentos', investimentosRoutes);

// fallback para teste sem banco
app.get('/api/mock/resumo', (req, res) => {
  res.json({
    receitas: 5200,
    despesas: 3100,
    saldo: 2100,
    porCategoria: [
      { name: 'Alimentação', value: 800 },
      { name: 'Transporte', value: 400 },
      { name: 'Moradia', value: 1200 },
      { name: 'Lazer', value: 700 }
    ]
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend rodando http://localhost:${PORT}`));
