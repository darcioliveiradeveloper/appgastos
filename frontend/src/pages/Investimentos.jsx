import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Investimentos(){
  const [lista,setLista]=useState([]);
  const [form,setForm]=useState({nome:'',tipo:'renda fixa',valorInvestido:''});
  const carregar=()=>api.get('/investimentos').then(r=>setLista(r.data)).catch(()=>setLista([]));
  useEffect(()=>{carregar()},[]);
  const salvar=async(e)=>{e.preventDefault(); await api.post('/investimentos',{...form,valorInvestido:Number(form.valorInvestido)}); setForm({nome:'',tipo:'renda fixa',valorInvestido:''}); carregar();};
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Investimentos</h1>
      <form onSubmit={salvar} className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-2">
        <input placeholder="Nome (ex: Tesouro Selic)" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} className="border p-2 rounded flex-1" required/>
        <select value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})} className="border p-2 rounded"><option>renda fixa</option><option>renda variável</option><option>cripto</option><option>fundo</option></select>
        <input placeholder="Valor" type="number" value={form.valorInvestido} onChange={e=>setForm({...form,valorInvestido:e.target.value})} className="border p-2 rounded w-32" required/>
        <button className="bg-slate-900 text-white px-4 rounded">Adicionar</button>
      </form>
      <div className="grid gap-3">{lista.map(i=>(
        <div key={i._id} className="bg-white p-4 rounded-xl shadow flex justify-between"><div><p className="font-bold">{i.nome}</p><p className="text-sm text-slate-500">{i.tipo}</p></div><p className="font-bold text-emerald-600">R$ {i.valorInvestido.toFixed(2)}</p></div>
      ))}{lista.length===0 && <p className="text-slate-500">Nenhum investimento cadastrado.</p>}</div>
    </div>
  )
}
