import { useEffect, useState } from 'react';
import api from '../services/api';
import { saveToQueue, getQueue, syncQueue, cacheTransacoes, getCachedTransacoes } from '../services/offline';
import useOnline from '../hooks/useOnline';

export default function Lancamentos() {
  const online = useOnline();
  const [lista, setLista] = useState([]);
  const [queueLen, setQueueLen] = useState(getQueue().length);
  const [form, setForm] = useState({ tipo: 'despesa', categoria: '', descricao: '', valor: '', data: new Date().toISOString().slice(0,10) });

  const carregar = async () => {
    try {
      const r = await api.get('/transacoes');
      setLista(r.data);
      cacheTransacoes(r.data);
    } catch {
      const cached = getCachedTransacoes();
      if (cached) setLista(cached);
      else setLista([]);
      // mescla fila offline para visualização
      const q = getQueue();
      if (q.length) setLista(prev => [...q.map(x=>({ ...x, _offline:true })), ...prev]);
    }
    setQueueLen(getQueue().length);
  };

  useEffect(()=>{ carregar(); }, []);
  // auto-sync quando volta online
  useEffect(()=>{
    if (online) syncQueue(api).then(r=>{ if(r.synced) carregar(); });
  },[online]);

  const salvar = async (e) => {
    e.preventDefault();
    const payload = { ...form, valor: Number(form.valor) };
    try {
      await api.post('/transacoes', payload);
      setForm({ ...form, categoria:'', descricao:'', valor:''});
      carregar();
    } catch(err){
      if (!err.response) { // offline / rede
        saveToQueue(payload);
        setQueueLen(getQueue().length);
        alert('📴 Sem conexão - salvo localmente! Sincroniza quando voltar.');
        setLista(prev => [{ ...payload, _offline:true, _id: Date.now().toString(), data: new Date().toISOString() }, ...prev]);
        setForm({ ...form, categoria:'', descricao:'', valor:''});
      } else alert(err.response?.data?.msg || err.message);
    }
  };

  const remover = async (id, isOffline) => {
    if (isOffline) { // remove da fila
      const q = getQueue().filter(x=>x._offlineId !== id && x._id !== id);
      localStorage.setItem('gastos_offline_queue', JSON.stringify(q));
      setLista(prev=> prev.filter(x=> (x._offlineId||x._id)!==id));
      setQueueLen(q.length);
      return;
    }
    try { await api.delete(`/transacoes/${id}`); } catch { // tenta offline: remove do cache
      const cached = getCachedTransacoes()||[];
      cacheTransacoes(cached.filter(x=>x._id!==id));
    }
    carregar();
  };

  const forcarSync = async () => {
    const r = await syncQueue(api);
    alert(`Sincronizados: ${r.synced}, restantes: ${r.remaining}`);
    carregar();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Lançamentos</h1>
      {queueLen>0 && <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl flex justify-between items-center"><span>⏳ {queueLen} pendentes offline</span><button onClick={forcarSync} className="bg-amber-600 text-white px-3 py-1 rounded text-sm">Sincronizar agora</button></div>}
      <form onSubmit={salvar} className="bg-white p-4 rounded-xl shadow grid grid-cols-2 md:grid-cols-5 gap-2">
        <select value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})} className="border p-2 rounded">
          <option value="despesa">Despesa</option><option value="receita">Receita</option><option value="investimento">Investimento</option>
        </select>
        <input placeholder="Categoria (ex: Alimentação)" value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})} className="border p-2 rounded" required/>
        <input placeholder="Descrição" value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})} className="border p-2 rounded"/>
        <input placeholder="Valor" type="number" step="0.01" value={form.valor} onChange={e=>setForm({...form,valor:e.target.value})} className="border p-2 rounded" required/>
        <button className="bg-emerald-600 text-white rounded px-4">{online? '+ Adicionar' : '💾 Salvar offline'}</button>
      </form>
      <div className="bg-white rounded-xl shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100"><tr><th className="p-2 text-left">Data</th><th className="p-2">Tipo</th><th className="p-2">Categoria</th><th className="p-2">Valor</th><th className="p-2"></th></tr></thead>
          <tbody>{lista.map(t=>(
            <tr key={t._id || t._offlineId} className={`border-t ${t._offline? 'bg-amber-50':''}`}><td className="p-2">{new Date(t.data).toLocaleDateString()} {t._offline && '⏳'}</td><td className="p-2 capitalize">{t.tipo}</td><td className="p-2">{t.categoria}</td><td className={`p-2 font-bold ${t.tipo==='receita'?'text-emerald-600':'text-red-600'}`}>R$ {Number(t.valor).toFixed(2)}</td><td className="p-2"><button onClick={()=>remover(t._id||t._offlineId, !!t._offline)} className="text-red-600">excluir</button></td></tr>
          ))}</tbody>
        </table>
        {lista.length===0 && <p className="p-4 text-slate-500">Nenhum lançamento. {online? 'Faça login e adicione um.': 'Você está offline - adições serão salvas localmente.'}</p>}
      </div>
    </div>
  )
}
