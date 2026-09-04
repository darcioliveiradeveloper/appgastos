import { useEffect, useState } from 'react';
import api from '../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function Dashboard() {
  const hoje = new Date();
  const [mes, setMes] = useState(String(hoje.getMonth()+1));
  const [ano, setAno] = useState(String(hoje.getFullYear()));
  const [data, setData] = useState(null);
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(true);

  const carregar = async (m = mes, a = ano) => {
    setLoading(true); setErro(null);
    try {
      const r = await api.get(`/transacoes/resumo?mes=${m}&ano=${a}`);
      setData(r.data);
    } catch {
      try {
        const r = await api.get('/mock/resumo');
        setData({ ...r.data, evolucao: [] });
      } catch (e) { setErro(e.message); }
    } finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const anos = [hoje.getFullYear()-2, hoje.getFullYear()-1, hoje.getFullYear(), hoje.getFullYear()+1];

  if (loading) return <p>Carregando...</p>;
  if (erro) return <p className="text-red-600">Erro: {erro}</p>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2 items-center bg-white p-2 rounded-xl shadow">
          <select value={mes} onChange={e=>setMes(e.target.value)} className="border p-2 rounded">
            {Array.from({length:12},(_,i)=> <option key={i+1} value={i+1}>{String(i+1).padStart(2,'0')}</option>)}
          </select>
          <select value={ano} onChange={e=>setAno(e.target.value)} className="border p-2 rounded">
            {anos.map(a=> <option key={a} value={a}>{a}</option>)}
          </select>
          <button onClick={()=>carregar(mes, ano)} className="bg-slate-900 text-white px-4 py-2 rounded">Filtrar</button>
          <button onClick={()=>{const m=String(hoje.getMonth()+1), a=String(hoje.getFullYear()); setMes(m); setAno(a); carregar(m,a);}} className="border px-3 py-2 rounded">Hoje</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card titulo={`Receitas ${mes}/${ano}`} valor={data.receitas} cor="text-emerald-600" />
        <Card titulo={`Despesas ${mes}/${ano}`} valor={data.despesas} cor="text-red-600" />
        <Card titulo="Saldo do período" valor={data.saldo} cor={data.saldo >= 0 ? 'text-emerald-600' : 'text-red-600'} />
      </div>

      {/* Evolução 6 meses */}
      {data.evolucao?.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Evolução últimos 6 meses</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.evolucao}>
              <XAxis dataKey="mes" /><YAxis /><Tooltip /><Legend />
              <Line type="monotone" dataKey="receitas" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="saldo" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Despesas por Categoria ({mes}/{ano})</h2>
          {data.porCategoria?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data.porCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({name, percent})=>(`${name} ${(percent*100).toFixed(0)}%`)}>
                  {data.porCategoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v=>`R$ ${Number(v).toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-sm">Sem despesas no período.</p>}
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Receita vs Despesa</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={[{ name: `${mes}/${ano}`, receitas: data.receitas, despesas: data.despesas }]}>
              <XAxis dataKey="name" /><YAxis /><Tooltip /><Legend />
              <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
              <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-500 mt-2">{data.total} lançamentos no período</p>
        </div>
      </div>
      <p className="text-sm text-slate-500">💡 Dica: Vá em Relatórios para exportar CSV/PDF e ver detalhes por categoria.</p>
    </div>
  )
}
function Card({ titulo, valor, cor }) {
  return <div className="bg-white p-5 rounded-xl shadow"><p className="text-slate-500 text-sm">{titulo}</p><p className={`text-2xl font-bold ${cor}`}>R$ {Number(valor||0).toFixed(2)}</p></div>
}
