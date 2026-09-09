import { useEffect, useState } from 'react';
import api from '../services/api';
import { CardPadrao, TituloCard, TituloPagina, Grid } from '../components/ui/CardPadrao';

export default function Investimentos(){
  const [lista,setLista]=useState([]);
  const [form,setForm]=useState({nome:'',tipo:'renda fixa',valorInvestido:''});
  const carregar=()=>api.get('/investimentos').then(r=>setLista(r.data)).catch(()=>setLista([]));
  useEffect(()=>{carregar()},[]);
  const salvar=async(e)=>{e.preventDefault(); await api.post('/investimentos',{...form,valorInvestido:Number(form.valorInvestido)}); setForm({nome:'',tipo:'renda fixa',valorInvestido:''}); carregar();};
  const total = lista.reduce((s,i)=>s+Number(i.valorInvestido),0);
  return (
    <div className="space-y-2 w-full max-w-6xl mx-auto overflow-hidden">
      <TituloPagina subtitulo="Aportes e rentabilidade">Investimentos</TituloPagina>
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5 rounded-2xl shadow flex justify-between items-center w-full overflow-hidden">
        <div><h2 className="text-lg font-extrabold">📈 Total Investido</h2><p className="text-emerald-100 text-sm">{lista.length} ativos</p></div>
        <div className="bg-white text-emerald-600 px-4 py-2 rounded-xl font-extrabold">R$ {total.toFixed(2)}</div>
      </div>
      <CardPadrao>
        <TituloCard>Novo investimento</TituloCard>
        <form onSubmit={salvar} className="grid md:grid-cols-4 gap-2">
          <input placeholder="Nome (Tesouro Selic)" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} className="border border-slate-200 p-3 rounded-xl" required/>
          <select value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})} className="border border-slate-200 p-3 rounded-xl"><option>renda fixa</option><option>renda variável</option><option>cripto</option><option>fundo</option></select>
          <input placeholder="Valor" type="number" value={form.valorInvestido} onChange={e=>setForm({...form,valorInvestido:e.target.value})} className="border border-slate-200 p-3 rounded-xl" required/>
          <button className="bg-emerald-600 text-white rounded-xl font-bold">+ Adicionar</button>
        </form>
      </CardPadrao>
      <Grid cols={2}>
        {lista.map(i=>(
          <div key={i._id} className="bg-white rounded-2xl shadow border p-5 flex justify-between w-full overflow-hidden"><div><p className="font-extrabold text-slate-800">{i.nome}</p><p className="text-sm text-slate-500">{i.tipo}</p></div><p className="font-extrabold text-emerald-600">R$ {i.valorInvestido.toFixed(2)}</p></div>
        ))}
      </Grid>
      {lista.length===0 && <CardPadrao><p className="text-slate-500">Nenhum investimento cadastrado.</p></CardPadrao>}
    </div>
  )
}
