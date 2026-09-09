import { useEffect, useState } from 'react';
import api from '../services/api';
import { saveToQueue, getQueue, syncQueue, cacheTransacoes, getCachedTransacoes } from '../services/offline';
import useOnline from '../hooks/useOnline';
import { CardPadrao, TituloCard, TituloPagina } from '../components/ui/CardPadrao';

export default function Receitas(){
  const online = useOnline();
  const [lista,setLista]=useState([]);
  const [form,setForm]=useState({ categoria:'', descricao:'', valor:'', data: new Date().toISOString().slice(0,10) });
  const carregar = async ()=>{
    try{ const r=await api.get('/transacoes?tipo=receita'); setLista(r.data); cacheTransacoes(r.data); } catch{
      const c=getCachedTransacoes(); if(c) setLista(c.filter(x=>x.tipo==='receita'));
      const q=getQueue().filter(x=>x.tipo==='receita'); if(q.length) setLista(prev=>[...q.map(x=>({...x,_offline:true,_id:x._offlineId})),...prev]);
    }
  };
  useEffect(()=>{carregar();},[]);
  useEffect(()=>{ if(online) syncQueue(api).then(r=>r.synced&&carregar()); },[online]);
  const salvar=async(e)=>{
    e.preventDefault();
    const payload={ tipo:'receita', categoria:form.categoria, descricao:form.descricao, valor:Number(form.valor), data:form.data };
    try{ await api.post('/transacoes',payload); setForm({...form,categoria:'',descricao:'',valor:''}); carregar(); }
    catch(err){ if(!err.response){ saveToQueue(payload); alert('📴 Offline - receita salva local'); setLista(prev=>[{...payload,_offline:true,_id:Date.now().toString(),data:new Date().toISOString()},...prev]); } else alert(err.response?.data?.msg); }
  };
  const total = lista.reduce((s,t)=>s+Number(t.valor),0);
  return (
    <div className="space-y-2 w-full max-w-6xl mx-auto overflow-hidden">
      <TituloPagina subtitulo="Entradas do mês">Receitas</TituloPagina>
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-5 rounded-2xl shadow flex justify-between items-center w-full overflow-hidden">
        <div><h2 className="text-lg font-extrabold">💚 Total Receitas</h2><p className="text-emerald-100 text-sm">Soma do período</p></div>
        <div className="bg-white text-emerald-600 px-4 py-2 rounded-xl font-extrabold">R$ {total.toFixed(2)}</div>
      </div>
      <CardPadrao>
        <TituloCard>Nova receita</TituloCard>
        <form onSubmit={salvar} className="grid md:grid-cols-5 gap-2">
          <input placeholder="Categoria (Salário)" value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})} className="border border-slate-200 p-3 rounded-xl" required/>
          <input placeholder="Descrição" value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})} className="border border-slate-200 p-3 rounded-xl"/>
          <input type="number" step="0.01" placeholder="Valor" value={form.valor} onChange={e=>setForm({...form,valor:e.target.value})} className="border border-slate-200 p-3 rounded-xl" required/>
          <input type="date" value={form.data} onChange={e=>setForm({...form,data:e.target.value})} className="border border-slate-200 p-3 rounded-xl"/>
          <button className="bg-emerald-600 text-white rounded-xl font-bold">+ Adicionar</button>
        </form>
      </CardPadrao>
      <CardPadrao>
        <TituloCard>Lista de receitas</TituloCard>
        <div className="overflow-auto w-full">
          <table className="w-full text-sm"><thead className="bg-emerald-50"><tr><th className="p-3 text-left">Data</th><th className="p-3">Categoria</th><th className="p-3">Descrição</th><th className="p-3 text-right">Valor</th></tr></thead>
          <tbody>{lista.map(t=><tr key={t._id} className="border-t"><td className="p-3">{new Date(t.data).toLocaleDateString()} {t._offline?'⏳':''}</td><td className="p-3">{t.categoria}</td><td className="p-3">{t.descricao||'-'}</td><td className="p-3 text-right font-bold text-emerald-600">R$ {Number(t.valor).toFixed(2)}</td></tr>)}</tbody></table>
          {lista.length===0 && <p className="p-4 text-slate-500">Nenhuma receita. Adicione acima.</p>}
        </div>
      </CardPadrao>
    </div>
  )
}
