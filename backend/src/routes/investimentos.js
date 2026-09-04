import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import Investimento from '../models/Investimento.js';

const router = Router();
router.use(auth);

router.post('/', async (req, res) => {
  const inv = await Investimento.create({ ...req.body, user: req.userId });
  res.status(201).json(inv);
});
router.get('/', async (req, res) => {
  res.json(await Investimento.find({ user: req.userId }).sort({ createdAt: -1 }));
});
router.delete('/:id', async (req, res) => {
  await Investimento.deleteOne({ _id: req.params.id, user: req.userId });
  res.json({ msg: 'Removido' });
});
export default router;
