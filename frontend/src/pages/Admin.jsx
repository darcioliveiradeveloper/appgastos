import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Admin(){
  const nav = useNavigate();
  const [lista, setLista] = useState([]);
  const [msg, setMsg] = useState('');
  const [user, setUser] = useState(null);

  useEffect(()=>{
    const u = JSON.parse(localStorage.getItem('user')||'null');
    setUser(u);
    if (!localStorage.getItem('token')) nav('/login');
  },[]);

  const carregar = async () => {
    try { const r = await api.get('/admin/codigos'); setLista(r.data); } catch(e){ setMsg(e.response?.data?.msg || e.message); }
  };
  useEffect(()=>{ carregar(); },[]);

  const gerar = async () => {
    setMsg('');
    try { const r = await api.post('/admin/gerar-codigo'); setMsg(`✅ Código gerado: ${r.data.codigo}`); carregar(); } catch(e){ setMsg(e.response?.data?.msg || e.message); }
  };
  const copiar = (code) => { navigator.clipboard.writeText(code); setMsg(`📋 Copiado: ${code}`); };
  const revogar = async (id) => { if(!confirm('Revogar código?')) return; await api.delete(`/admin/codigos/${id}`); carregar(); };

  if (user && user.role !== 'admin') return <div className="bg-red-50 border border-red-200 p-6 rounded-xl"><h1 className="font-bold text-red-700">Acesso restrito Master</h1><p className="text-sm text-red-600">Faça login com admin@teste.com / admin123</p></div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-extrabold">👑 Painel Master - AppGastos</h1>
        <p className="text-indigo-100 text-sm">Gere códigos de ativação para novos usuários. Cada código vale 1 conta e expira em 30 dias.</p>
        <p className="text-xs bg-white/20 inline-block px-3 py-1 rounded-full mt-2">Logado: {user?.email} ({user?.role})</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-3 items-center">
        <button onClick={gerar} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-bold shadow">+ Gerar novo código</button>
        <button onClick={carregar} className="border px-4 py-3 rounded-xl">🔄 Atualizar</button>
        {msg && <span className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm">{msg}</span>}
      </div>

      <div className="bg-white rounded-xl shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr><th className="p-3 text-left">Código</th><th className="p-3">Status</th><th className="p-3">Criado</th><th className="p-3">Usado por</th><th className="p-3"></th></tr></thead>
          <tbody>
            {lista.map(c=>(
              <tr key={c._id} className="border-t">
                <td className="p-3 font-mono font-bold text-indigo-600">{c.codigo} <button onClick={()=>copiar(c.codigo)} className="ml-2 text-xs bg-slate-100 px-2 py-1 rounded">copiar</button></td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${c.usado?'bg-red-100 text-red-700':'bg-emerald-100 text-emerald-700'}`}>{c.usado? 'Usado':'Disponível'}</span></td>
                <td className="p-3 text-xs">{new Date(c.createdAt).toLocaleString('pt-BR')}<br/><span className="text-slate-400">expira {new Date(c.expiraEm).toLocaleDateString()}</span></td>
                <td className="p-3 text-xs">{c.usadoPor? `${c.usadoPor.email}` : '-'}</td>
                <td className="p-3"><button onClick={()=>revogar(c._id)} className="text-red-600 text-xs">revogar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length===0 && <p className="p-4 text-slate-500">Nenhum código. Clique em Gerar.</p>}
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-sm">
        <p className="font-bold">Como funciona:</p>
        <ol className="list-decimal ml-5 space-y-1">
          <li>Gere código aqui e envie para o cliente (WhatsApp)</li>
          <li>Cliente cria conta em /login → Aba Criar conta → cola código</li>
          <li>Código é uso único, expira em 30 dias</li>
        </ol>
      </div>
    </div>
  )
}
