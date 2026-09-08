import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Codigo from '../models/CodigoAtivacao.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, codigoAtivacao } = req.body;
    // código obrigatório exceto para seeds já existentes (admins legados)
    const bypassEmails = ['admin@appgastos.com'];
    if (!bypassEmails.includes(email)) {
      if (!codigoAtivacao) return res.status(400).json({ msg: 'Código de ativação obrigatório' });
      const doc = await Codigo.findOne({ codigo: codigoAtivacao.toUpperCase().trim() });
      if (!doc) return res.status(400).json({ msg: 'Código inválido' });
      if (doc.usado) return res.status(400).json({ msg: 'Código já utilizado' });
      if (doc.expiraEm < new Date()) return res.status(400).json({ msg: 'Código expirado' });
      // marca uso após criar usuário
      if (await User.findOne({ email })) return res.status(400).json({ msg: 'Email já cadastrado' });
      const user = await User.create({ nome, email, senha });
      doc.usado = true; doc.usadoPor = user._id; doc.usadoEm = new Date(); await doc.save();
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
      return res.status(201).json({ token, user: { id: user._id, nome: user.nome, email: user.email } });
    }
    // admin sem código (fallback)
    if (await User.findOne({ email })) return res.status(400).json({ msg: 'Email já cadastrado' });
    const user = await User.create({ nome, email, senha, role: 'admin' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.status(201).json({ token, user: { id: user._id, nome: user.nome, email: user.email } });
  } catch (e) { res.status(500).json({ msg: e.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.compararSenha(senha))) return res.status(401).json({ msg: 'Credenciais inválidas' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ token, user: { id: user._id, nome: user.nome, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ msg: e.message }); }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ msg: 'Não autenticado' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('nome email role');
    if (!user) return res.status(404).json({ msg: 'Usuário não encontrado' });
    res.json({ id: user._id, nome: user.nome, email: user.email, role: user.role });
  } catch (e) { res.status(401).json({ msg: 'Token inválido' }); }
});

router.post('/trocar-senha', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ msg: 'Não autenticado' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { novaSenha } = req.body;
    if (!novaSenha || novaSenha.length < 4) return res.status(400).json({ msg: 'Senha deve ter ao menos 4 caracteres' });
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ msg: 'Usuário não encontrado' });
    user.senha = novaSenha;
    await user.save();
    res.json({ msg: 'Senha alterada' });
  } catch (e) { res.status(500).json({ msg: e.message }); }
});

export default router;
