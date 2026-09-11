import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import Pagamento from '../models/PagamentoFatura.js';
const router = Router();
router.use(auth);
router.get('/', async (req,res)=>{
  const { cartao } = req.query;
  let filtro = { user: req.userId };
  if (cartao) filtro.cartao = cartao;
  res.json(await Pagamento.find(filtro).sort({ data:-1 }).limit(50));
});
router.post('/', async (req,res)=>{
  const { cartao, valor, cartaoId } = req.body;
  const p = await Pagamento.create({ user: req.userId, cartao, cartaoId, valor: Number(valor) });
  res.status(201).json(p);
});
export default router;
