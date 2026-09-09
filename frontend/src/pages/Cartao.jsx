import { useEffect, useState } from 'react';
import api from '../services/api';
import { CardPadrao, TituloCard, TituloPagina, Grid } from '../components/ui/CardPadrao';

export default function Cartao(){
  const [cartoes,setCartoes]=useState([]);
  const [form,setForm]=useState({ nome:'', limite:'', vencimento:'10', cor:'#4f46e5' });
  const [fatura,setFatura]=useState([]);
  const [trans,setTrans]=useState({ categoria:'', descricao:'', valor:'', cartao:'' });
  const [limiteSel,setLimiteSel]=useState('');
  const [limiteUsadoInput,setLimiteUsadoInput]=useState('');

  const carregarCartoes = async ()=>{ try{ const r=await api.get('/cartoes'); setCartoes(r.data); if(r.data[0]) { setTrans(s=>({...s,cartao:r.data[0].nome})); setLimiteSel(r.data[0].nome); } } catch{} };
  const carregarFatura = async ()=>{ try{ const r=await api.get('/transacoes'); setFatura(r.data.filter(t=>t.conta && t.conta!=='carteira')); } catch{ setFatura([]);} };
  useEffect(()=>{ carregarCartoes(); carregarFatura(); },[]);

  const criarCartao = async(e)=>{ e.preventDefault(); await api.post('/cartoes', { nome:form.nome, limite:Number(form.limite), vencimento:Number(form.vencimento), cor:form.cor }); setForm({ nome:'', limite:'', vencimento:'10', cor:'#4f46e5' }); carregarCartoes(); };
  const excluirCartao = async(id)=>{ await api.delete(`/cartoes/${id}`); carregarCartoes(); };
  const lancarCartao = async(e)=>{ e.preventDefault(); await api.post('/transacoes', { tipo:'despesa', categoria:trans.categoria, descricao:trans.descricao, valor:Number(trans.valor), conta:trans.cartao }); setTrans({...trans,categoria:'',descricao:'',valor:''}); carregarFatura(); };
  const totalFatura = fatura.reduce((s,t)=>s+Number(t.valor),0);

  // Limites Disponíveis cálculos
  const hoje = new Date();
  const mes = hoje.getMonth();
  const ano = hoje.getFullYear();
  const cartaoSelecionado = cartoes.find(c=>c.nome===limiteSel);
  const faturaDoCartao = fatura.filter(f=>f.conta===limiteSel);
  const faturaProxima = faturaDoCartao.filter(f=>{ const d=new Date(f.data); return d.getMonth()===mes && d.getFullYear()===ano; }).reduce((s,t)=>s+t.valor,0);
  const totalUsadoCalculado = faturaDoCartao.reduce((s,t)=>s+t.valor,0);
  // se usuário não digitou, usa calculado como sugestão
  const limiteUsado = limiteUsadoInput === '' ? totalUsadoCalculado : Number(limiteUsadoInput||0);
  const limiteTotal = cartaoSelecionado ? cartaoSelecionado.limite : 0;
  const limiteDisponivel = limiteTotal - limiteUsado;
  const futurasFaturas = limiteUsado - faturaProxima;

  useEffect(()=>{
    if (cartaoSelecionado) {
      const total = fatura.filter(f=>f.conta===cartaoSelecionado.nome).reduce((s,t)=>s+t.valor,0);
      setLimiteUsadoInput(String(total));
    }
  }, [limiteSel, fatura]);

  return (
    <div className="space-y-2 w-full max-w-6xl mx-auto overflow-hidden">
      <TituloPagina subtitulo="Fatura e cartões">Cartão</TituloPagina>
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-5 rounded-2xl shadow flex justify-between items-center w-full overflow-hidden">
        <div><h2 className="text-lg font-extrabold">💳 Fatura Total</h2><p className="text-violet-100 text-sm">Soma dos cartões</p></div>
        <div className="bg-white text-violet-600 px-4 py-2 rounded-xl font-extrabold">R$ {totalFatura.toFixed(2)}</div>
      </div>
      <Grid cols={3}>
        {cartoes.map(c=>(
          <div key={c._id} className="rounded-2xl p-5 text-white shadow w-full overflow-hidden" style={{background: c.cor}}>
            <p className="font-extrabold">{c.nome}</p><p className="text-sm opacity-80">Limite R$ {c.limite.toFixed(2)} • Venc dia {c.vencimento}</p>
            <p className="text-xs mt-2 opacity-60">Gastos: R$ {fatura.filter(f=>f.conta===c.nome).reduce((s,t)=>s+t.valor,0).toFixed(2)}</p>
            <button onClick={()=>excluirCartao(c._id)} className="text-xs bg-white/20 px-2 py-1 rounded mt-2">excluir</button>
          </div>
        ))}
      </Grid>
      {cartoes.length===0 && <p className="text-slate-500 text-sm">Nenhum cartão. Crie abaixo.</p>}
      <CardPadrao>
        <TituloCard>Novo cartão</TituloCard>
        <form onSubmit={criarCartao} className="grid md:grid-cols-5 gap-2">
          <input placeholder="Nome (Nubank)" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} className="border border-slate-200 p-3 rounded-xl" required/>
          <input placeholder="Limite total (ex: 3000)" value={form.limite} onChange={e=>setForm({...form,limite:e.target.value})} className="border border-slate-200 p-3 rounded-xl" required/>
          <input placeholder="Vencimento dia (ex: 10)" type="number" value={form.vencimento} onChange={e=>setForm({...form,vencimento:e.target.value})} className="border border-slate-200 p-3 rounded-xl"/>
          <input type="color" value={form.cor} onChange={e=>setForm({...form,cor:e.target.value})} className="border p-1 rounded-xl h-[48px]"/>
          <button className="bg-violet-600 text-white rounded-xl font-bold">+ Cartão</button>
        </form>
      </CardPadrao>

      <CardPadrao>
        <TituloCard>Limites Disponíveis</TituloCard>
        <p className="text-xs text-slate-500 mb-3">Escolha o cartão para ver limite total, fatura e disponível. Ex: limite 3000, disponível 100, fatura 1200 → futuras 1700 são parcelas de outros meses.</p>
        <div className="grid md:grid-cols-2 gap-2 mb-3">
          <select value={limiteSel} onChange={e=>setLimiteSel(e.target.value)} className="border border-slate-200 p-3 rounded-xl w-full">
            <option value="">Selecione o cartão</option>
            {cartoes.map(c=> <option key={c._id} value={c.nome}>{c.nome} — Limite R$ {c.limite.toFixed(2)}</option>)}
          </select>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex justify-between"><span className="text-sm text-slate-600">Limite total</span><b className="text-slate-800">R$ {limiteTotal.toFixed(2)}</b></div>
        </div>
        {limiteSel && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl"><p className="text-xs font-extrabold text-emerald-700">Próxima fatura</p><p className="font-extrabold text-emerald-700">R$ {faturaProxima.toFixed(2)}</p><p className="text-xs text-slate-500">a pagar mês atual</p></div>
            <div className="bg-white border border-slate-200 p-3 rounded-xl"><p className="text-xs font-extrabold text-slate-600">Limite usado</p><input type="number" value={limiteUsadoInput} onChange={e=>setLimiteUsadoInput(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg mt-1 font-bold" placeholder="Ex: 2900"/><p className="text-xs text-slate-400">total já comprometido</p></div>
            <div className={`p-3 rounded-xl border ${limiteDisponivel<0?'bg-red-50 border-red-200 text-red-700':'bg-violet-50 border-violet-200 text-violet-700'}`}><p className="text-xs font-extrabold">Limite disponível</p><p className="font-extrabold">R$ {limiteDisponivel.toFixed(2)}</p><p className="text-xs opacity-70">{limiteDisponivel<0?'estourado':''}</p></div>
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl"><p className="text-xs font-extrabold text-amber-700">Futuras faturas</p><p className="font-extrabold text-amber-700">R$ {futurasFaturas.toFixed(2)}</p><p className="text-xs text-slate-500">parcelas outros meses</p></div>
          </div>
        )}
      </CardPadrao>

      <CardPadrao>
        <TituloCard>Lançar no cartão</TituloCard>
        <form onSubmit={lancarCartao} className="grid md:grid-cols-5 gap-2">
          <select value={trans.cartao} onChange={e=>setTrans({...trans,cartao:e.target.value})} className="border border-slate-200 p-3 rounded-xl">{cartoes.map(c=><option key={c._id} value={c.nome}>{c.nome}</option>)}</select>
          <input placeholder="Categoria" value={trans.categoria} onChange={e=>setTrans({...trans,categoria:e.target.value})} className="border border-slate-200 p-3 rounded-xl" required/>
          <input placeholder="Descrição" value={trans.descricao} onChange={e=>setTrans({...trans,descricao:e.target.value})} className="border border-slate-200 p-3 rounded-xl"/>
          <input placeholder="Valor" type="number" step="0.01" value={trans.valor} onChange={e=>setTrans({...trans,valor:e.target.value})} className="border border-slate-200 p-3 rounded-xl" required/>
          <button className="bg-indigo-600 text-white rounded-xl font-bold">Lançar</button>
        </form>
      </CardPadrao>
      <CardPadrao>
        <TituloCard>Fatura detalhada</TituloCard>
        <div className="overflow-auto w-full">
          <table className="w-full text-sm"><thead className="bg-violet-50"><tr><th className="p-3 text-left">Data</th><th className="p-3">Cartão</th><th className="p-3">Categoria</th><th className="p-3 text-right">Valor</th></tr></thead>
          <tbody>{fatura.map(t=> <tr key={t._id} className="border-t"><td className="p-3">{new Date(t.data).toLocaleDateString('pt-BR', {timeZone:'UTC'})}</td><td className="p-3">{t.conta}</td><td className="p-3">{t.categoria}</td><td className="p-3 text-right font-bold text-violet-600">R$ {t.valor.toFixed(2)}</td></tr>)}</tbody></table>
          {fatura.length===0 && <p className="p-4 text-slate-500">Nenhum gasto no cartão.</p>}
        </div>
      </CardPadrao>
    </div>
  )
}
