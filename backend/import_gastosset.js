import dns from 'dns';
try{dns.setServers(['8.8.8.8','1.1.1.1'])}catch{}
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import User from './src/models/User.js';
import Transacao from './src/models/Transacao.js';
import Cartao from './src/models/Cartao.js';

await mongoose.connect(process.env.MONGO_URI);
const user = await User.findOne({ email: 'admin@appgastos.com' });
if (!user) { console.log('admin not found'); process.exit(1); }
console.log('import para', user.email, user._id);

// limpar antigos
await Transacao.deleteMany({ user: user._id });
await Cartao.deleteMany({ user: user._id });
console.log('limpos');

// dados do Excel
const receitas = [
  { categoria:'Salario', valor:1600, data:'2026-09-01', periodo:'09/12' },
  { categoria:'Caju', valor:760, data:'2026-09-01', periodo:'09/12' },
  { categoria:'Vale', valor:1500, data:'2026-09-15', periodo:'09/12' },
  { categoria:'Caju', valor:650, data:'2026-09-15', periodo:'09/12' },
];
const despesas = [
  { categoria:'Mercado Pago', valor:69, data:'2026-09-16', periodo:'1/5' },
  { categoria:'Copel Agosto', valor:190, data:'2026-08-20', periodo:'08/12' },
  { categoria:'Copel Setembro', valor:190, data:'2026-09-20', periodo:'09/12' },
  { categoria:'Mhnet', valor:161, data:'2026-09-20', periodo:'09/12' },
  { categoria:'Hsconsorcio', valor:215, data:'2026-09-10', periodo:'5/100' },
  { categoria:'Iptu', valor:46, data:'2026-10-20', periodo:'8/10' },
  { categoria:'Iptu', valor:46, data:'2026-11-20', periodo:'9/10' },
  { categoria:'Iptu', valor:46, data:'2026-12-20', periodo:'10/10' },
  { categoria:'Klubi Cel', valor:71, data:'2026-09-10', periodo:'24/24' },
  { categoria:'Klubi TV', valor:204, data:'2026-09-10', periodo:'6/24' },
  { categoria:'Sanepar', valor:115, data:'2026-08-15', periodo:'8/12' },
  { categoria:'Sanepar', valor:110, data:'2026-09-15', periodo:'9/12' },
];
const cartoes = [
  { nome:'Sicredi', vencimento:19, fatura:2016, limite:3000, gasto:2972, sobra:28, parcelado:956 },
  { nome:'PicPay', vencimento:14, fatura:665, limite:1880, gasto:1868, sobra:12, parcelado:1203 },
  { nome:'Inter', vencimento:12, fatura:794, limite:2100, gasto:2079, sobra:21, parcelado:1285 },
  { nome:'Nubank', vencimento:11, fatura:542, limite:800, gasto:800, sobra:0, parcelado:258 },
];

for (const r of receitas) {
  await Transacao.create({ user: user._id, tipo:'receita', categoria:r.categoria, descricao:'', valor:r.valor, data:new Date(r.data+'T12:00:00'), periodo:r.periodo, conta:'carteira' });
}
for (const d of despesas) {
  await Transacao.create({ user: user._id, tipo:'despesa', categoria:d.categoria, descricao:'', valor:d.valor, data:new Date(d.data+'T12:00:00'), periodo:d.periodo, conta:'carteira' });
}
for (const c of cartoes) {
  await Cartao.create({ user: user._id, nome:c.nome, limite:c.limite, vencimento:c.vencimento, cor:'#4f46e5' });
  // para refletir limites, criamos despesas de cartão para fatura? Vamos criar uma despesa no cartão para fatura atual
  if (c.fatura) {
    await Transacao.create({ user: user._id, tipo:'despesa', categoria:'Fatura', descricao:c.nome, valor:c.fatura, data:new Date('2026-09-15T12:00:00'), periodo:'09/12', conta:c.nome });
  }
}
const total = await Transacao.find({user:user._id});
console.log('transacoes criadas', total.length);
console.log('receitas', total.filter(t=>t.tipo==='receita').reduce((s,t)=>s+t.valor,0));
console.log('despesas', total.filter(t=>t.tipo==='despesa').reduce((s,t)=>s+t.valor,0));
const carts = await Cartao.find({user:user._id});
console.log('cartoes', carts.length);
await mongoose.disconnect();
console.log('done');
