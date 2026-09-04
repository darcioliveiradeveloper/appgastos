import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ msg: 'Email já cadastrado' });
    const user = await User.create({ nome, email, senha });
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
    res.json({ token, user: { id: user._id, nome: user.nome, email: user.email } });
  } catch (e) { res.status(500).json({ msg: e.message }); }
});

export default router;
