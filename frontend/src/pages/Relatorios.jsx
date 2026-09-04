import { useState } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Relatorios(){
  const hoje = new Date();
  const [mes, setMes] = useState(String(hoje.getMonth()+1));
  const [ano, setAno] = useState(String(hoje.getFullYear()));
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const buscar = async () => {
    setLoading(true); setMsg('');
    try {
      let url = '/transacoes/relatorio';
      const params = new URLSearchParams();
      if (inicio && fim) { params.set('inicio', inicio); params.set('fim', fim); }
      else { params.set('mes', mes); params.set('ano', ano); }
      const r = await api.get(`${url}?${params.toString()}`);
      setData(r.data);
    } catch (e){ setMsg(e.response?.data?.msg || e.message); }
    finally { setLoading(false); }
  };

  const exportCSV = () => {
    if (!data?.transacoes?.length) return alert('Nada para exportar');
    const header = ['data','tipo','categoria','descricao','valor','conta'];
    const rows = data.transacoes.map(t=>[
      new Date(t.data).toLocaleDateString('pt-BR'),
      t.tipo, t.categoria, `"${(t.descricao||'').replace(/"/g,'""')}"`, String(t.valor).replace('.',','), t.conta||''
    ].join(';'));
    const csv = [header.join(';'), ...rows].join('\n');
    const blob = new Blob(["\uFEFF"+csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`relatorio_${mes}-${ano}.csv`; a.click(); URL.revokeObjectURL(url);
  };
  const exportJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`backup_gastos_${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url);
  };
  const imprimir = () => window.print();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Relatórios</h1>

      <div className="bg-white p-4 rounded-xl shadow space-y-3">
        <div className="flex flex-wrap gap-2 items-end">
          <div><label className="text-xs text-slate-500">Mês</label><select value={mes} onChange={e=>setMes(e.target.value)} className="border p-2 rounded w-full"><option value="">--</option>{Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{String(i+1).padStart(2,'0')}</option>)}</select></div>
          <div><label className="text-xs text-slate-500">Ano</label><select value={ano} onChange={e=>setAno(e.target.value)} className="border p-2 rounded w-full"><option value="">--</option>{[2023,2024,2025,2026,2027].map(a=> <option key={a} value={a}>{a}</option>)}</select></div>
          <span className="text-slate-400">ou</span>
          <div><label className="text-xs text-slate-500">Início</label><input type="date" value={inicio} onChange={e=>setInicio(e.target.value)} className="border p-2 rounded w-full"/></div>
          <div><label className="text-xs text-slate-500">Fim</label><input type="date" value={fim} onChange={e=>setFim(e.target.value)} className="border p-2 rounded w-full"/></div>
          <button onClick={buscar} className="bg-slate-900 text-white px-6 py-2 rounded">Buscar</button>
        </div>
        <p className="text-xs text-slate-500">Escolha Mês/Ano ou intervalo de datas. Local (IndexedDB) + Nuvem (Atlas) sincronizados via API.</p>
      </div>

      {loading && <p>Carregando relatório...</p>}
      {msg && <p className="text-red-600">{msg}</p>}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPI titulo="Receitas" valor={data.receitas} cor="text-emerald-600" />
            <KPI titulo="Despesas" valor={data.despesas} cor="text-red-600" />
            <KPI titulo="Saldo" valor={data.saldo} cor={data.saldo>=0?'text-emerald-600':'text-red-600'} />
            <KPI titulo="Lançamentos" valor={data.total} cor="text-slate-900" isMoney={false} />
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="font-semibold mb-2">Por Categoria</h2>
            {data.porCategoria.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.porCategoria.map(c=>({ name:`${c.categoria} (${c.tipo})`, valor:c.valor }))}>
                  <XAxis dataKey="name" tick={{fontSize:10}} interval={0} angle={-15} textAnchor="end" height={70} />
                  <YAxis /><Tooltip formatter={v=>`R$ ${Number(v).toFixed(2)}`} /><Legend />
                  <Bar dataKey="valor" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            ): <p className="text-slate-500 text-sm">Sem dados.</p>}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              {data.porCategoria.map((c,i)=> <div key={i} className="border p-2 rounded flex justify-between"><span>{c.categoria} <span className="text-xs text-slate-500">({c.tipo})</span></span><b>R$ {c.valor.toFixed(2)}</b></div>)}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-2">
            <button onClick={exportCSV} className="bg-emerald-600 text-white px-4 py-2 rounded">📄 Exportar CSV</button>
            <button onClick={exportJSON} className="bg-slate-900 text-white px-4 py-2 rounded">💾 Backup JSON (nuvem+local)</button>
            <button onClick={imprimir} className="border px-4 py-2 rounded">🖨️ Imprimir / PDF</button>
            <span className="text-xs text-slate-500 self-center ml-2">CSV abre no Excel; JSON é cópia completa para restaurar; Imprimir salva PDF.</span>
          </div>

          <div className="bg-white rounded-xl shadow overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100"><tr><th className="p-2 text-left">Data</th><th className="p-2">Tipo</th><th className="p-2">Categoria</th><th className="p-2">Descrição</th><th className="p-2 text-right">Valor</th></tr></thead>
              <tbody>
                {data.transacoes.map(t=> (
                  <tr key={t._id} className="border-t">
                    <td className="p-2">{new Date(t.data).toLocaleDateString('pt-BR')}</td>
                    <td className="p-2"><span className={`px-2 py-1 rounded text-xs ${t.tipo==='receita'?'bg-emerald-100 text-emerald-700': t.tipo==='despesa'?'bg-red-100 text-red-700':'bg-blue-100 text-blue-700'}`}>{t.tipo}</span></td>
                    <td className="p-2">{t.categoria}</td>
                    <td className="p-2">{t.descricao||'-'}</td>
                    <td className={`p-2 text-right font-bold ${t.tipo==='receita'?'text-emerald-600':'text-red-600'}`}>R$ {Number(t.valor).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.transacoes.length===0 && <p className="p-4 text-slate-500">Nenhum lançamento no período.</p>}
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
            <p><b>Armazenamento:</b> Nuvem MongoDB Atlas (cluster0.hxe2xzb) + Local (cache PWA IndexedDB). Backup JSON serve como cópia em nuvem (Drive) e restauração local.</p>
            <p><b>Compartilhar no celular:</b> Use Exportar CSV/JSON e compartilhe via WhatsApp/Drive; ou conecte backend no Render/Vercel para acesso externo.</p>
          </div>
        </>
      )}
    </div>
  )
}
function KPI({titulo, valor, cor, isMoney=true}){
  return <div className="bg-white p-4 rounded-xl shadow"><p className="text-xs text-slate-500">{titulo}</p><p className={`text-xl font-bold ${cor}`}>{isMoney? `R$ ${Number(valor||0).toFixed(2)}` : valor}</p></div>
}
