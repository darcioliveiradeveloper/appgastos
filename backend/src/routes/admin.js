import { Router } from 'express';
import crypto from 'crypto';
import { isAdmin } from '../middleware/isAdmin.js';
import Codigo from '../models/CodigoAtivacao.js';

const router = Router();

function gerarCodigo() {
  // APP-XXXX-XXXX ex: APP-8K2F-9PQ1
  const part = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `APP-${part()}-${part()}`;
}

// gerar novo código
router.post('/gerar-codigo', isAdmin, async (req, res) => {
  let codigo;
  for (let i=0;i<5;i++) {
    const c = gerarCodigo();
    if (!await Codigo.findOne({ codigo: c })) { codigo = c; break; }
  }
  if (!codigo) return res.status(500).json({ msg: 'Erro ao gerar' });
  const doc = await Codigo.create({ codigo, criadoPor: req.userId });
  res.status(201).json(doc);
});

// listar códigos
router.get('/codigos', isAdmin, async (req, res) => {
  const lista = await Codigo.find().populate('criadoPor', 'email nome').populate('usadoPor', 'email nome').sort({ createdAt: -1 }).limit(100);
  res.json(lista);
});

// validar código (público para pré-checar, mas também usa no register)
router.post('/validar', async (req, res) => {
  const { codigo } = req.body;
  const doc = await Codigo.findOne({ codigo: codigo?.toUpperCase().trim() });
  if (!doc) return res.status(404).json({ valido: false, msg: 'Código não encontrado' });
  if (doc.usado) return res.status(400).json({ valido: false, msg: 'Código já usado' });
  if (doc.expiraEm < new Date()) return res.status(400).json({ valido: false, msg: 'Código expirado' });
  res.json({ valido: true });
});

// deletar / revogar
router.delete('/codigos/:id', isAdmin, async (req, res) => {
  await Codigo.deleteOne({ _id: req.params.id });
  res.json({ msg: 'Removido' });
});

export default router;
