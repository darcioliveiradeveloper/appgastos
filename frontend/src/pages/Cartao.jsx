import { useEffect, useState } from 'react';
import api from '../services/api';
import { CardPadrao, TituloCard, TituloPagina, Grid } from '../components/ui/CardPadrao';

export default function Cartao(){
  const [cartoes,setCartoes]=useState([]);
  const [form,setForm]=useState({ nome:'', limite:'', vencimento:'10', cor:'#4f46e5' });
  const [editId,setEditId]=useState(null);
  const [fatura,setFatura]=useState([]);
  const [trans,setTrans]=useState({ categoria:'', descricao:'', valor:'', cartao:'' });
  const [limiteSel,setLimiteSel]=useState('');
  const [limites,setLimites]=useState({ proxima:'', usado:'', disponivel:'', futuras:'' });

  const carregarCartoes = async ()=>{ try{ const r=await api.get('/cartoes'); setCartoes(r.data); if(r.data[0] && !limiteSel) { setTrans(s=>({...s,cartao:r.data[0].nome})); setLimiteSel(r.data[0].nome); } } catch{} };
  const carregarFatura = async ()=>{ try{ const r=await api.get('/transacoes'); setFatura(r.data.filter(t=>t.conta && t.conta!=='carteira')); } catch{ setFatura([]);} };
  useEffect(()=>{ carregarCartoes(); carregarFatura(); },[]);

  const salvarCartao = async(e)=>{
    e.preventDefault();
    if (editId) {
      await api.delete(`/cartoes/${editId}`);
      await api.post('/cartoes', { nome:form.nome, limite:Number(form.limite), vencimento:Number(form.vencimento), cor:form.cor });
      setEditId(null);
    } else {
      await api.post('/cartoes', { nome:form.nome, limite:Number(form.limite), vencimento:Number(form.vencimento), cor:form.cor });
    }
    setForm({ nome:'', limite:'', vencimento:'10', cor:'#4f46e5' }); carregarCartoes();
  };
  const editarCartao = (c)=>{ setForm({ nome:c.nome, limite:String(c.limite), vencimento:String(c.vencimento), cor:c.cor }); setEditId(c._id); window.scrollTo({top:0,behavior:'smooth'}); };
  const excluirCartao = async(id)=>{ if(!confirm('Excluir cartão?')) return; await api.delete(`/cartoes/${id}`); carregarCartoes(); };
  const lancarCartao = async(e)=>{ e.preventDefault(); await api.post('/transacoes', { tipo:'despesa', categoria:trans.categoria, descricao:trans.descricao, valor:Number(trans.valor), conta:trans.cartao }); setTrans({...trans,categoria:'',descricao:'',valor:''}); carregarFatura(); };
  const totalFatura = fatura.reduce((s,t)=>s+Number(t.valor),0);

  const cartaoSelecionado = cartoes.find(c=>c.nome===limiteSel);

  return (
    <div className="space-y-2 w-full max-w-6xl mx-auto overflow-hidden">
      <TituloPagina subtitulo="Fatura e cartões">Cartão</TituloPagina>
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-5 rounded-2xl shadow flex justify-between items-center w-full overflow-hidden">
        <div><h2 className="text-lg font-extrabold">💳 Fatura Total</h2><p className="text-violet-100 text-sm">Soma dos cartões</p></div>
        <div className="bg-white text-violet-600 px-4 py-2 rounded-xl font-extrabold">R$ {totalFatura.toFixed(2)}</div>
      </div>

      <CardPadrao>
        <TituloCard>{editId ? 'Editar cartão' : 'Novo cartão'}</TituloCard>
        <form onSubmit={salvarCartao} className="grid md:grid-cols-5 gap-2">
          <input placeholder="Nome (Nubank)" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} className="border border-slate-200 p-3 rounded-xl" required/>
          <input placeholder="Limite total (ex: 3000)" value={form.limite} onChange={e=>setForm({...form,limite:e.target.value})} className="border border-slate-200 p-3 rounded-xl" required/>
          <input placeholder="Vencimento dia (ex: 10)" type="number" value={form.vencimento} onChange={e=>setForm({...form,vencimento:e.target.value})} className="border border-slate-200 p-3 rounded-xl"/>
          <input type="color" value={form.cor} onChange={e=>setForm({...form,cor:e.target.value})} className="border p-1 rounded-xl h-[48px]"/>
          <button className={`${editId?'bg-amber-600':'bg-violet-600'} text-white rounded-xl font-bold`}>{editId?'Salvar':' + Cartão'}</button>
        </form>
        {editId && <button onClick={()=>{setEditId(null); setForm({ nome:'', limite:'', vencimento:'10', cor:'#4f46e5' });}} className="text-sm text-slate-500 mt-2">Cancelar edição</button>}
      </CardPadrao>

      <Grid cols={3}>
        {cartoes.map(c=>(
          <div key={c._id} className="rounded-2xl p-5 text-white shadow w-full overflow-hidden relative" style={{background: c.cor}}>
            <p className="font-extrabold">{c.nome}</p><p className="text-sm opacity-80">Limite R$ {c.limite.toFixed(2)} • Venc dia {c.vencimento}</p>
            <p className="text-xs mt-2 opacity-60">Gastos: R$ {fatura.filter(f=>f.conta===c.nome).reduce((s,t)=>s+t.valor,0).toFixed(2)}</p>
            <div className="flex gap-1 mt-2">
              <button onClick={()=>editarCartao(c)} className="w-7 h-7 bg-white/30 rounded-full flex items-center justify-center text-xs">✏️</button>
              <button onClick={()=>excluirCartao(c._id)} className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-xs">🗑️</button>
            </div>
          </div>
        ))}
      </Grid>
      {cartoes.length===0 && <p className="text-slate-500 text-sm">Nenhum cartão. Crie acima.</p>}

      <CardPadrao>
        <TituloCard>Limites Disponíveis</TituloCard>
        <p className="text-xs text-slate-500 mb-3">Preencha com dados do banco. Ex: limite 3000, próxima 1200, usado 2900 → disponível 100, futuras 1700.</p>
        <div className="grid md:grid-cols-2 gap-2 mb-3">
          <select value={limiteSel} onChange={e=>setLimiteSel(e.target.value)} className="border border-slate-200 p-3 rounded-xl w-full">
            <option value="">Selecione o cartão</option>
            {cartoes.map(c=> <option key={c._id} value={c.nome}>{c.nome} — Limite R$ {c.limite.toFixed(2)}</option>)}
          </select>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex justify-between"><span className="text-sm text-slate-600">Limite total</span><b className="text-slate-800">R$ {cartaoSelecionado ? cartaoSelecionado.limite.toFixed(2) : '0.00'}</b></div>
        </div>
        {limiteSel && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl"><p className="text-xs font-extrabold text-emerald-700">Próxima fatura</p><input value={limites.proxima} onChange={e=>setLimites({...limites,proxima:e.target.value})} placeholder="1200" className="w-full bg-white border border-emerald-200 p-2 rounded-lg mt-1 font-bold text-emerald-700" /><p className="text-xs text-slate-500">a pagar mês atual</p></div>
            <div className="bg-white border border-slate-200 p-3 rounded-xl"><p className="text-xs font-extrabold text-slate-600">Limite usado</p><input value={limites.usado} onChange={e=>setLimites({...limites,usado:e.target.value})} placeholder="2900" className="w-full border border-slate-200 p-2 rounded-lg mt-1 font-bold" /><p className="text-xs text-slate-400">total já comprometido</p></div>
            <div className="bg-violet-50 border border-violet-200 p-3 rounded-xl"><p className="text-xs font-extrabold text-violet-700">Limite disponível</p><input value={limites.disponivel} onChange={e=>setLimites({...limites,disponivel:e.target.value})} placeholder="100" className="w-full bg-white border border-violet-200 p-2 rounded-lg mt-1 font-bold text-violet-700" /><p className="text-xs text-slate-500">após fatura</p></div>
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl"><p className="text-xs font-extrabold text-amber-700">Futuras faturas</p><input value={limites.futuras} onChange={e=>setLimites({...limites,futuras:e.target.value})} placeholder="1700" className="w-full bg-white border border-amber-200 p-2 rounded-lg mt-1 font-bold text-amber-700" /><p className="text-xs text-slate-500">parcelas outros meses</p></div>
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
