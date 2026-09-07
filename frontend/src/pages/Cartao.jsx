import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Cartao(){
  const [cartoes,setCartoes]=useState([]);
  const [form,setForm]=useState({ nome:'', limite:'', vencimento:'10', cor:'#4f46e5' });
  const [fatura,setFatura]=useState([]);
  const [trans,setTrans]=useState({ categoria:'', descricao:'', valor:'', cartao:'' });

  const carregarCartoes = async ()=>{ try{ const r=await api.get('/cartoes'); setCartoes(r.data); if(r.data[0]) setTrans(s=>({...s,cartao:r.data[0].nome})); } catch{} };
  const carregarFatura = async ()=>{ try{ const r=await api.get('/transacoes'); setFatura(r.data.filter(t=>t.conta && t.conta!=='carteira')); } catch{ setFatura([]);} };
  useEffect(()=>{ carregarCartoes(); carregarFatura(); },[]);

  const criarCartao = async(e)=>{
    e.preventDefault();
    await api.post('/cartoes', { nome:form.nome, limite:Number(form.limite), vencimento:Number(form.vencimento), cor:form.cor });
    setForm({ nome:'', limite:'', vencimento:'10', cor:'#4f46e5' }); carregarCartoes();
  };
  const excluirCartao = async(id)=>{ await api.delete(`/cartoes/${id}`); carregarCartoes(); };
  const lancarCartao = async(e)=>{
    e.preventDefault();
    await api.post('/transacoes', { tipo:'despesa', categoria:trans.categoria, descricao:trans.descricao, valor:Number(trans.valor), conta:trans.cartao });
    setTrans({...trans,categoria:'',descricao:'',valor:''}); carregarFatura();
  };
  const totalFatura = fatura.reduce((s,t)=>s+Number(t.valor),0);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-6 rounded-2xl shadow flex justify-between items-center">
        <div><h1 className="text-2xl font-extrabold">💳 Cartão</h1><p className="text-violet-100 text-sm">Fatura e cartões</p></div>
        <div className="bg-white text-violet-600 px-4 py-2 rounded-xl font-extrabold">Fatura R$ {totalFatura.toFixed(2)}</div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {cartoes.map(c=>(
          <div key={c._id} className="rounded-2xl p-5 text-white shadow" style={{background: c.cor}}>
            <p className="font-bold">{c.nome}</p><p className="text-sm opacity-80">Limite R$ {c.limite.toFixed(2)} • Venc {c.vencimento}</p>
            <p className="text-xs mt-2 opacity-60">Gastos neste cartão: R$ {fatura.filter(f=>f.conta===c.nome).reduce((s,t)=>s+t.valor,0).toFixed(2)}</p>
            <button onClick={()=>excluirCartao(c._id)} className="text-xs bg-white/20 px-2 py-1 rounded mt-2">excluir</button>
          </div>
        ))}
        {cartoes.length===0 && <p className="text-slate-500">Nenhum cartão. Crie abaixo.</p>}
      </div>

      <form onSubmit={criarCartao} className="bg-white p-4 rounded-xl shadow grid md:grid-cols-5 gap-2">
        <input placeholder="Nome (Nubank, C6)" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} className="border p-3 rounded-xl" required/>
        <input placeholder="Limite" type="number" value={form.limite} onChange={e=>setForm({...form,limite:e.target.value})} className="border p-3 rounded-xl" required/>
        <input placeholder="Venc dia" type="number" value={form.vencimento} onChange={e=>setForm({...form,vencimento:e.target.value})} className="border p-3 rounded-xl"/>
        <input type="color" value={form.cor} onChange={e=>setForm({...form,cor:e.target.value})} className="border p-1 rounded-xl h-[48px]"/>
        <button className="bg-violet-600 text-white rounded-xl font-bold">+ Cartão</button>
      </form>

      <form onSubmit={lancarCartao} className="bg-white p-4 rounded-xl shadow grid md:grid-cols-5 gap-2">
        <select value={trans.cartao} onChange={e=>setTrans({...trans,cartao:e.target.value})} className="border p-3 rounded-xl">{cartoes.map(c=><option key={c._id} value={c.nome}>{c.nome}</option>)}</select>
        <input placeholder="Categoria" value={trans.categoria} onChange={e=>setTrans({...trans,categoria:e.target.value})} className="border p-3 rounded-xl" required/>
        <input placeholder="Descrição" value={trans.descricao} onChange={e=>setTrans({...trans,descricao:e.target.value})} className="border p-3 rounded-xl"/>
        <input placeholder="Valor" type="number" step="0.01" value={trans.valor} onChange={e=>setTrans({...trans,valor:e.target.value})} className="border p-3 rounded-xl" required/>
        <button className="bg-indigo-600 text-white rounded-xl font-bold">Lançar no cartão</button>
      </form>

      <div className="bg-white rounded-xl shadow overflow-auto">
        <table className="w-full text-sm"><thead className="bg-violet-50"><tr><th className="p-3 text-left">Data</th><th className="p-3">Cartão</th><th className="p-3">Categoria</th><th className="p-3 text-right">Valor</th></tr></thead>
        <tbody>{fatura.map(t=> <tr key={t._id} className="border-t"><td className="p-3">{new Date(t.data).toLocaleDateString()}</td><td className="p-3">{t.conta}</td><td className="p-3">{t.categoria}</td><td className="p-3 text-right font-bold text-violet-600">R$ {t.valor.toFixed(2)}</td></tr>)}</tbody></table>
        {fatura.length===0 && <p className="p-4 text-slate-500">Nenhum gasto no cartão.</p>}
      </div>
    </div>
  )
}
