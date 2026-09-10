import { useEffect, useState } from 'react';
import api from '../services/api';
import { CardPadrao, TituloCard, TituloPagina, Grid } from '../components/ui/CardPadrao';

export default function Investimentos(){
  const [lista,setLista]=useState([]);
  const [form,setForm]=useState({nome:'',tipo:'renda fixa',valorInvestido:''});
  const [editId,setEditId]=useState(null);
  const carregar=()=>api.get('/investimentos').then(r=>setLista(r.data)).catch(()=>setLista([]));
  useEffect(()=>{carregar()},[]);
  const salvar=async(e)=>{
    e.preventDefault();
    const payload={...form,valorInvestido:Number(form.valorInvestido)};
    try{
      if (editId) await api.delete(`/investimentos/${editId}`);
      await api.post('/investimentos',payload);
      setForm({nome:'',tipo:'renda fixa',valorInvestido:''}); setEditId(null); carregar();
    } catch(err){ alert(err.response?.data?.msg||err.message); }
  };
  const editar=(item)=>{ setForm({nome:item.nome, tipo:item.tipo, valorInvestido:String(item.valorInvestido)}); setEditId(item._id); window.scrollTo({top:0,behavior:'smooth'}); };
  const excluir=async(id)=>{ if(!confirm('Excluir investimento?')) return; await api.delete(`/investimentos/${id}`); carregar(); };
  const total = lista.reduce((s,i)=>s+Number(i.valorInvestido),0);
  return (
    <div className="space-y-2 w-full max-w-6xl mx-auto overflow-hidden">
      <TituloPagina subtitulo="Aportes e rentabilidade">Investimentos</TituloPagina>
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5 rounded-2xl shadow flex justify-between items-center w-full overflow-hidden">
        <div><h2 className="text-lg font-extrabold">📈 Total Investido</h2><p className="text-emerald-100 text-sm">{lista.length} ativos</p></div>
        <div className="bg-white text-emerald-600 px-4 py-2 rounded-xl font-extrabold">R$ {total.toFixed(2)}</div>
      </div>
      <CardPadrao>
        <TituloCard>{editId ? 'Editar investimento' : 'Novo investimento'}</TituloCard>
        <form onSubmit={salvar} className="grid md:grid-cols-4 gap-2">
          <input placeholder="Nome (Tesouro Selic)" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} className="border border-slate-200 p-3 rounded-xl" required/>
          <select value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})} className="border border-slate-200 p-3 rounded-xl"><option>renda fixa</option><option>renda variável</option><option>cripto</option><option>fundo</option></select>
          <input placeholder="Valor" type="number" value={form.valorInvestido} onChange={e=>setForm({...form,valorInvestido:e.target.value})} className="border border-slate-200 p-3 rounded-xl" required/>
          <button className={`${editId?'bg-amber-600':'bg-emerald-600'} text-white rounded-xl font-bold`}>{editId?'Salvar':'+ Adicionar'}</button>
        </form>
        {editId && <button onClick={()=>{setEditId(null); setForm({nome:'',tipo:'renda fixa',valorInvestido:''});}} className="text-sm text-slate-500 mt-2">Cancelar edição</button>}
      </CardPadrao>
      <Grid cols={2}>
        {lista.map(i=>(
          <div key={i._id} className="bg-white rounded-2xl shadow border p-5 flex justify-between items-center w-full overflow-hidden"><div><p className="font-extrabold text-slate-800">{i.nome}</p><p className="text-sm text-slate-500">{i.tipo}</p></div><div className="flex items-center gap-2"><p className="font-extrabold text-emerald-600">R$ {i.valorInvestido.toFixed(2)}</p><button onClick={()=>editar(i)} title="Editar" className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center">✏️</button><button onClick={()=>excluir(i._id)} title="Excluir" className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center">🗑️</button></div></div>
        ))}
      </Grid>
      {lista.length===0 && <CardPadrao><p className="text-slate-500">Nenhum investimento cadastrado.</p></CardPadrao>}
    </div>
  )
}
