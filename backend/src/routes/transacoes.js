import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import Transacao from '../models/Transacao.js';

const router = Router();
router.use(auth);

// criar
router.post('/', async (req, res) => {
  const t = await Transacao.create({ ...req.body, user: req.userId });
  res.status(201).json(t);
});
// listar com filtros
router.get('/', async (req, res) => {
  const { mes, ano, tipo } = req.query;
  let filtro = { user: req.userId };
  if (tipo) filtro.tipo = tipo;
  if (mes && ano) {
    const inicio = new Date(Date.UTC(ano, mes - 1, 1, 0, 0, 0));
    const fim = new Date(Date.UTC(ano, mes, 0, 23, 59, 59, 999));
    filtro.data = { $gte: inicio, $lte: fim };
  }
  const lista = await Transacao.find(filtro).sort({ data: -1 });
  res.json(lista);
});
// resumo para gráficos + evolução 6 meses
router.get('/resumo', async (req, res) => {
  const { mes, ano } = req.query;
  const inicio = mes && ano ? new Date(Date.UTC(ano, mes - 1, 1, 0, 0, 0)) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const fim = mes && ano ? new Date(Date.UTC(ano, mes, 0, 23, 59, 59, 999)) : new Date();
  const transacoes = await Transacao.find({ user: req.userId, data: { $gte: inicio, $lte: fim } });
  const receitas = transacoes.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0);
  const despesas = transacoes.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0);
  const porCategoria = Object.entries(transacoes.filter(t => t.tipo === 'despesa').reduce((acc, t) => {
    acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));
  // evolução últimos 12 meses (para Ano)
  const evolucao = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const m = d.getMonth() + 1; const y = d.getFullYear();
    const ini = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0)); const f = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
    const tmes = await Transacao.find({ user: req.userId, data: { $gte: ini, $lte: f } });
    const rec = tmes.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0);
    const des = tmes.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0);
    evolucao.push({ mes: `${String(m).padStart(2,'0')}/${y}`, receitas: rec, despesas: des, saldo: rec - des });
  }
  res.json({ receitas, despesas, saldo: receitas - despesas, porCategoria, total: transacoes.length, evolucao });
});

// relatório detalhado com agregações
router.get('/relatorio', async (req, res) => {
  const { mes, ano, inicio: qInicio, fim: qFim } = req.query;
  let filtro = { user: req.userId };
  if (qInicio && qFim) {
    filtro.data = { $gte: new Date(qInicio), $lte: new Date(qFim) };
  } else if (mes && ano) {
    const ini = new Date(Date.UTC(ano, mes - 1, 1, 0, 0, 0)); const f = new Date(Date.UTC(ano, mes, 0, 23, 59, 59, 999));
    filtro.data = { $gte: ini, $lte: f };
  }
  const lista = await Transacao.find(filtro).sort({ data: -1 });
  const receitas = lista.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0);
  const despesas = lista.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0);
  const porCategoria = Object.entries(lista.reduce((acc, t) => {
    const k = `${t.tipo}:${t.categoria}`;
    acc[k] = (acc[k] || 0) + t.valor;
    return acc;
  }, {})).map(([k, v]) => { const [tipo, categoria] = k.split(':'); return { tipo, categoria, valor: v }; });
  const porTipo = {
    receita: lista.filter(t => t.tipo === 'receita').length,
    despesa: lista.filter(t => t.tipo === 'despesa').length,
    investimento: lista.filter(t => t.tipo === 'investimento').length
  };
  res.json({ filtro, total: lista.length, receitas, despesas, saldo: receitas - despesas, porCategoria, porTipo, transacoes: lista });
});
router.delete('/:id', async (req, res) => {
  await Transacao.deleteOne({ _id: req.params.id, user: req.userId });
  res.json({ msg: 'Removido' });
});

export default router;
