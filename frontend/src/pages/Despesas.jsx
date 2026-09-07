import { useEffect, useState } from 'react';
import api from '../services/api';
import { saveToQueue, getQueue, syncQueue, cacheTransacoes, getCachedTransacoes } from '../services/offline';
import useOnline from '../hooks/useOnline';

export default function Despesas(){
  const online = useOnline();
  const [lista,setLista]=useState([]);
  const [form,setForm]=useState({ categoria:'', descricao:'', valor:'', data: new Date().toISOString().slice(0,10), conta:'carteira' });
  const carregar = async ()=>{
    try{ const r=await api.get('/transacoes?tipo=despesa'); setLista(r.data); cacheTransacoes(r.data); } catch{
      const c=getCachedTransacoes(); if(c) setLista(c.filter(x=>x.tipo==='despesa' && x.conta==='carteira'));
      const q=getQueue().filter(x=>x.tipo==='despesa'); if(q.length) setLista(prev=>[...q.map(x=>({...x,_offline:true,_id:x._offlineId})),...prev]);
    }
  };
  useEffect(()=>{carregar();},[]);
  useEffect(()=>{ if(online) syncQueue(api).then(r=>r.synced&&carregar()); },[online]);
  const salvar=async(e)=>{
    e.preventDefault();
    const payload={ tipo:'despesa', categoria:form.categoria, descricao:form.descricao, valor:Number(form.valor), data:form.data, conta:'carteira' };
    try{ await api.post('/transacoes',payload); setForm({...form,categoria:'',descricao:'',valor:''}); carregar(); }
    catch(err){ if(!err.response){ saveToQueue(payload); alert('📴 Offline - despesa salva'); setLista(prev=>[{...payload,_offline:true,_id:Date.now().toString(),data:new Date().toISOString()},...prev]); } else alert(err.response?.data?.msg); }
  };
  const total = lista.reduce((s,t)=>s+Number(t.valor),0);
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-2xl shadow flex justify-between items-center">
        <div><h1 className="text-2xl font-extrabold">🔴 Despesas</h1><p className="text-red-100 text-sm">Saídas em dinheiro / débito</p></div>
        <div className="bg-white text-red-600 px-4 py-2 rounded-xl font-extrabold">R$ {total.toFixed(2)}</div>
      </div>
      <form onSubmit={salvar} className="bg-white p-4 rounded-xl shadow grid md:grid-cols-5 gap-2">
        <input placeholder="Categoria (Mercado, Aluguel)" value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})} className="border p-3 rounded-xl" required/>
        <input placeholder="Descrição" value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})} className="border p-3 rounded-xl"/>
        <input type="number" step="0.01" placeholder="Valor" value={form.valor} onChange={e=>setForm({...form,valor:e.target.value})} className="border p-3 rounded-xl" required/>
        <input type="date" value={form.data} onChange={e=>setForm({...form,data:e.target.value})} className="border p-3 rounded-xl"/>
        <button className="bg-red-600 text-white rounded-xl font-bold">+ Adicionar</button>
      </form>
      <div className="bg-white rounded-xl shadow overflow-auto">
        <table className="w-full text-sm"><thead className="bg-red-50"><tr><th className="p-3 text-left">Data</th><th className="p-3">Categoria</th><th className="p-3">Descrição</th><th className="p-3 text-right">Valor</th></tr></thead>
        <tbody>{lista.map(t=><tr key={t._id} className="border-t"><td className="p-3">{new Date(t.data).toLocaleDateString()} {t._offline?'⏳':''}</td><td className="p-3">{t.categoria}</td><td className="p-3">{t.descricao||'-'}</td><td className="p-3 text-right font-bold text-red-600">R$ {Number(t.valor).toFixed(2)}</td></tr>)}</tbody></table>
        {lista.length===0 && <p className="p-4 text-slate-500">Nenhuma despesa.</p>}
      </div>
    </div>
  )
}
