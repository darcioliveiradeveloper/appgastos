import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
const router = Router();
router.use(auth);
router.post('/nome', async (req,res)=>{
  const { nome } = req.body;
  if (!nome || nome.trim().length < 2) return res.status(400).json({ msg: 'Nome inválido' });
  const user = await User.findById(req.userId);
  user.nome = nome.trim();
  await user.save();
  res.json({ id: user._id, nome: user.nome, email: user.email, role: user.role });
});
export default router;
