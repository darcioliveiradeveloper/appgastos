import { useState } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CardPadrao, TituloCard, TituloPagina, Grid } from '../components/ui/CardPadrao';

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
    <div className="space-y-2 w-full max-w-6xl mx-auto overflow-hidden">
      <TituloPagina subtitulo="Filtre por período e exporte">Relatórios</TituloPagina>

      <CardPadrao>
        <div className="flex flex-wrap gap-2 items-end">
          <div><label className="text-xs font-extrabold text-slate-600">Mês</label><select value={mes} onChange={e=>setMes(e.target.value)} className="border border-slate-200 p-3 rounded-xl w-full"><option value="">--</option>{Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{String(i+1).padStart(2,'0')}</option>)}</select></div>
          <div><label className="text-xs font-extrabold text-slate-600">Ano</label><select value={ano} onChange={e=>setAno(e.target.value)} className="border border-slate-200 p-3 rounded-xl w-full"><option value="">--</option>{[2023,2024,2025,2026,2027].map(a=> <option key={a} value={a}>{a}</option>)}</select></div>
          <span className="text-slate-400">ou</span>
          <div><label className="text-xs font-extrabold text-slate-600">Início</label><input type="date" value={inicio} onChange={e=>setInicio(e.target.value)} className="border border-slate-200 p-3 rounded-xl w-full"/></div>
          <div><label className="text-xs font-extrabold text-slate-600">Fim</label><input type="date" value={fim} onChange={e=>setFim(e.target.value)} className="border border-slate-200 p-3 rounded-xl w-full"/></div>
          <button onClick={buscar} className="bg-[var(--c2)] text-white px-6 py-3 rounded-xl font-bold">Buscar</button>
        </div>
        <p className="text-xs text-slate-500 mt-2">Escolha Mês/Ano ou intervalo. Sincronizado Atlas + local.</p>
      </CardPadrao>

      {loading && <p>Carregando relatório...</p>}
      {msg && <p className="text-red-600">{msg}</p>}

      {data && (
        <>
          <Grid cols={4}>
            <KPI titulo="Receitas" valor={data.receitas} cor="text-emerald-600" />
            <KPI titulo="Despesas" valor={data.despesas} cor="text-red-600" />
            <KPI titulo="Saldo" valor={data.saldo} cor={data.saldo>=0?'text-emerald-600':'text-red-600'} />
            <KPI titulo="Lançamentos" valor={data.total} cor="text-slate-900" isMoney={false} />
          </Grid>

          <CardPadrao>
            <TituloCard>Por Categoria</TituloCard>
            {data.porCategoria.length ? (
              <div className="w-full overflow-hidden">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.porCategoria.map(c=>({ name:`${c.categoria} (${c.tipo})`, valor:c.valor }))}>
                    <XAxis dataKey="name" tick={{fontSize:10}} interval={0} angle={-15} textAnchor="end" height={70} />
                    <YAxis tick={{fontSize:10}} width={60} /><Tooltip formatter={v=>`R$ ${Number(v).toFixed(2)}`} /><Legend />
                    <Bar dataKey="valor" fill="#4338ca" radius={[8,8,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ): <p className="text-slate-500 text-sm">Sem dados.</p>}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              {data.porCategoria.map((c,i)=> <div key={i} className="border border-slate-200 p-3 rounded-xl flex justify-between"><span>{c.categoria} <span className="text-xs text-slate-500">({c.tipo})</span></span><b>R$ {c.valor.toFixed(2)}</b></div>)}
            </div>
          </CardPadrao>

          <CardPadrao>
            <div className="flex flex-wrap gap-2">
              <button onClick={exportCSV} className="bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold">📄 CSV</button>
              <button onClick={exportJSON} className="bg-slate-900 text-white px-4 py-3 rounded-xl font-bold">💾 JSON</button>
              <button onClick={imprimir} className="border border-slate-200 px-4 py-3 rounded-xl font-bold">🖨️ PDF</button>
              <span className="text-xs text-slate-500 self-center">CSV Excel • JSON backup • Imprimir PDF</span>
            </div>
          </CardPadrao>

          <CardPadrao>
            <TituloCard>Detalhamento</TituloCard>
            <div className="overflow-auto w-full">
              <table className="w-full text-sm">
                <thead className="bg-slate-50"><tr><th className="p-3 text-left">Data</th><th className="p-3">Tipo</th><th className="p-3">Categoria</th><th className="p-3">Descrição</th><th className="p-3 text-right">Valor</th></tr></thead>
                <tbody>
                  {data.transacoes.map(t=> (
                    <tr key={t._id} className="border-t">
                      <td className="p-3">{new Date(t.data).toLocaleDateString('pt-BR')}</td>
                      <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${t.tipo==='receita'?'bg-emerald-100 text-emerald-700': t.tipo==='despesa'?'bg-red-100 text-red-700':'bg-blue-100 text-blue-700'}`}>{t.tipo}</span></td>
                      <td className="p-3">{t.categoria}</td>
                      <td className="p-3">{t.descricao||'-'}</td>
                      <td className={`p-3 text-right font-extrabold ${t.tipo==='receita'?'text-emerald-600':'text-red-600'}`}>R$ {Number(t.valor).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.transacoes.length===0 && <p className="p-4 text-slate-500">Nenhum lançamento.</p>}
            </div>
          </CardPadrao>
        </>
      )}
    </div>
  )
}
function KPI({titulo, valor, cor, isMoney=true}){
  return <div className="bg-white rounded-2xl shadow border border-slate-100 p-5 w-full overflow-hidden"><p className="text-xs font-extrabold text-slate-600 tracking-tight">{titulo}</p><p className={`text-xl font-extrabold ${cor}`}>{isMoney? `R$ ${Number(valor||0).toFixed(2)}` : valor}</p></div>
}
