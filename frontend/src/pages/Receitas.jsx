import { useEffect, useState } from 'react';
import api from '../services/api';
import { saveToQueue, getQueue, syncQueue, cacheTransacoes, getCachedTransacoes } from '../services/offline';
import useOnline from '../hooks/useOnline';
import { CardPadrao, TituloCard, TituloPagina } from '../components/ui/CardPadrao';

export default function Receitas(){
  const online = useOnline();
  const [lista,setLista]=useState([]);
  const [form,setForm]=useState({ categoria:'', descricao:'', valor:'', data: new Date().toLocaleDateString('en-CA'), periodo: '' });
  const carregar = async ()=>{
    try{
      const r=await api.get('/transacoes?tipo=receita');
      const ordenada = [...r.data].sort((a,b)=> new Date(a.data) - new Date(b.data));
      setLista(ordenada); cacheTransacoes(ordenada);
    } catch{
      const c=getCachedTransacoes(); if(c) { const f=c.filter(x=>x.tipo==='receita').sort((a,b)=> new Date(a.data)-new Date(b.data)); setLista(f); }
      const q=getQueue().filter(x=>x.tipo==='receita'); if(q.length) setLista(prev=>[...q.map(x=>({...x,_offline:true,_id:x._offlineId})),...prev]);
    }
  };
  useEffect(()=>{carregar();},[]);
  useEffect(()=>{ if(online) syncQueue(api).then(r=>r.synced&&carregar()); },[online]);
  const [editId,setEditId]=useState(null);
  const salvar=async(e)=>{
    e.preventDefault();
    const payload={ tipo:'receita', categoria:form.categoria, descricao:form.descricao, valor:Number(form.valor), data:form.data, periodo: form.periodo || new Date(form.data).toLocaleDateString('pt-BR', {month:'2-digit', year:'2-digit', timeZone:'UTC'}).slice(3) };
    try{
      if (editId) { await api.delete(`/transacoes/${editId}`); setEditId(null); }
      await api.post('/transacoes',payload); setForm({ categoria:'', descricao:'', valor:'', data: new Date().toLocaleDateString('en-CA'), periodo: '' }); carregar();
    }
    catch(err){ if(!err.response){ saveToQueue(payload); alert('📴 Offline - receita salva local'); setLista(prev=>[{...payload,_offline:true,_id:Date.now().toString(),data:new Date().toISOString()},...prev]); } else alert(err.response?.data?.msg); }
  };
  const editar=(t)=>{ setForm({ categoria:t.categoria, descricao:t.descricao||'', valor:String(t.valor), data:new Date(t.data).toISOString().slice(0,10), periodo: t.periodo || new Date(t.data).toLocaleDateString('pt-BR', {month:'2-digit', year:'2-digit', timeZone:'UTC'}).slice(3) }); setEditId(t._id); window.scrollTo({top:0,behavior:'smooth'}); };
  const excluir=async(id)=>{ if(!confirm('Excluir receita?')) return; try{ await api.delete(`/transacoes/${id}`); carregar(); } catch(e){ alert(e.response?.data?.msg||e.message); } };
  const total = lista.reduce((s,t)=>s+Number(t.valor),0);
  return (
    <div className="space-y-2 w-full max-w-6xl mx-auto overflow-hidden">
      <TituloPagina subtitulo="Entradas do mês">Receitas</TituloPagina>
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-5 rounded-2xl shadow flex justify-between items-center w-full overflow-hidden">
        <div><h2 className="text-lg font-extrabold">💚 Total Receitas</h2><p className="text-emerald-100 text-sm">Soma do período</p></div>
        <div className="bg-white text-emerald-600 px-4 py-2 rounded-xl font-extrabold">R$ {total.toFixed(2)}</div>
      </div>
      <CardPadrao>
        <TituloCard>{editId ? 'Editar receita' : 'Nova receita'}</TituloCard>
        <form onSubmit={salvar} className="grid grid-cols-12 gap-2">
          <input type="date" value={form.data} onChange={e=>setForm({...form,data:e.target.value})} className="border border-slate-200 p-3 rounded-xl text-sm col-span-2" />
          <input placeholder="Categoria (Salário)" value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})} className="border border-slate-200 p-3 rounded-xl text-sm col-span-2" required/>
          <input placeholder="Descrição" value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})} className="border border-slate-200 p-3 rounded-xl text-sm col-span-3"/>
          <input placeholder="Período (09/12)" value={form.periodo} onChange={e=>setForm({...form,periodo:e.target.value})} className="border border-slate-200 p-3 rounded-xl text-sm col-span-2" />
          <input type="number" step="0.01" placeholder="Valor" value={form.valor} onChange={e=>setForm({...form,valor:e.target.value})} className="border border-slate-200 p-3 rounded-xl text-sm col-span-2" required/>
          <button className={`${editId?'bg-amber-600':'bg-emerald-600'} text-white rounded-xl font-bold text-sm col-span-1`}>{editId? 'Salvar' : '+ Adicionar'}</button>
        </form>
        {editId && <button onClick={()=>{setEditId(null); setForm({ categoria:'', descricao:'', valor:'', data: new Date().toLocaleDateString('en-CA'), periodo: '' });}} className="text-sm text-slate-500 mt-2">Cancelar edição</button>}
      </CardPadrao>
      <CardPadrao>
        <TituloCard>Lista de receitas</TituloCard>
        <div className="overflow-auto w-full">
          <table className="w-full text-sm table-fixed"><thead className="bg-emerald-50"><tr><th className="p-2 text-left w-[14%]">Data</th><th className="p-2 text-left w-[18%]">Categoria</th><th className="p-2 text-left">Descrição</th><th className="p-2 text-center w-[12%]">Período</th><th className="p-2 text-center w-[14%]">Valor</th><th className="p-2 text-center w-[14%]">Ações</th></tr></thead>
          <tbody>{lista.map(t=><tr key={t._id} className="border-t"><td className="p-2 text-left">{new Date(t.data).toLocaleDateString('pt-BR', {timeZone:'UTC'})} {t._offline?'⏳':''}</td><td className="p-2 text-left">{t.categoria}</td><td className="p-2 text-left">{t.descricao||'-'}</td><td className="p-2 text-center text-xs font-medium">{t.periodo || new Date(t.data).toLocaleDateString('pt-BR', {month:'2-digit', year:'numeric', timeZone:'UTC'})}</td><td className="p-2 text-center font-bold text-emerald-600 whitespace-nowrap">R$ {Number(t.valor).toFixed(2)}</td><td className="p-2"><div className="flex gap-1 justify-center"><button onClick={()=>editar(t)} title="Editar" className="w-7 h-7 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs">✏️</button><button onClick={()=>excluir(t._id)} title="Excluir" className="w-7 h-7 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs">🗑️</button></div></td></tr>)}</tbody></table>
          {lista.length===0 && <p className="p-4 text-slate-500">Nenhuma receita. Adicione acima.</p>}
        </div>
      </CardPadrao>
    </div>
  )
}
