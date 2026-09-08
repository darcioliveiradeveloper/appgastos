import { useEffect, useState } from 'react';
import api from '../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { CardPadrao, TituloCard, TituloPagina, Grid } from '../components/ui/CardPadrao';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

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
    <div className="space-y-6 w-full max-w-6xl mx-auto overflow-hidden">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <TituloPagina subtitulo="Visão geral do mês">Dashboard</TituloPagina>
        <div className="flex flex-wrap gap-2 items-center bg-white p-2 rounded-2xl shadow border border-slate-100 w-full md:w-auto">
          <select value={mes} onChange={e=>setMes(e.target.value)} className="border border-slate-200 p-2 rounded-xl flex-1 md:flex-none">
            {Array.from({length:12},(_,i)=> <option key={i+1} value={i+1}>{String(i+1).padStart(2,'0')}</option>)}
          </select>
          <select value={ano} onChange={e=>setAno(e.target.value)} className="border border-slate-200 p-2 rounded-xl flex-1 md:flex-none">
            {anos.map(a=> <option key={a} value={a}>{a}</option>)}
          </select>
          <button onClick={()=>carregar(mes, ano)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex-1 md:flex-none">Filtrar</button>
          <button onClick={()=>{const m=String(hoje.getMonth()+1), a=String(hoje.getFullYear()); setMes(m); setAno(a); carregar(m,a);}} className="border border-slate-200 px-3 py-2 rounded-xl flex-1 md:flex-none">Hoje</button>
        </div>
      </div>

      <Grid cols={3}>
        <KpiCard titulo={`Receitas ${mes}/${ano}`} valor={data.receitas} cor="text-emerald-600" bg="bg-emerald-50" />
        <KpiCard titulo={`Despesas ${mes}/${ano}`} valor={data.despesas} cor="text-red-600" bg="bg-red-50" />
        <KpiCard titulo="Saldo do período" valor={data.saldo} cor={data.saldo >= 0 ? 'text-emerald-600' : 'text-red-600'} bg={data.saldo>=0?'bg-emerald-50':'bg-red-50'} />
      </Grid>

      {/* Evolução 6 meses */}
      {data.evolucao?.length > 0 && (
        <CardPadrao>
          <TituloCard>Evolução últimos 6 meses</TituloCard>
          <div className="w-full overflow-hidden">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.evolucao}>
                <XAxis dataKey="mes" tick={{fontSize:12}} />
                <YAxis tick={{fontSize:12}} width={60} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="receitas" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="saldo" stroke="#4f46e5" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardPadrao>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        <CardPadrao>
          <TituloCard>Despesas por Categoria ({mes}/{ano})</TituloCard>
          {data.porCategoria?.length ? (
            <div className="w-full overflow-hidden">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={data.porCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false}>
                    {data.porCategoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v=>`R$ ${Number(v).toFixed(2)}`} />
                  <Legend wrapperStyle={{fontSize:12}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-slate-500 text-sm">Sem despesas no período.</p>}
        </CardPadrao>
        <CardPadrao>
          <TituloCard>Receita vs Despesa</TituloCard>
          <div className="w-full overflow-hidden">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={[{ name: `${mes}/${ano}`, receitas: data.receitas, despesas: data.despesas }]}>
                <XAxis dataKey="name" tick={{fontSize:12}} />
                <YAxis tick={{fontSize:12}} width={60} />
                <Tooltip />
                <Legend />
                <Bar dataKey="receitas" fill="#10b981" name="Receitas" radius={[8,8,0,0]} />
                <Bar dataKey="despesas" fill="#ef4444" name="Despesas" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 mt-2">{data.total} lançamentos no período</p>
        </CardPadrao>
      </div>
      <p className="text-sm text-slate-500">💡 Dica: Vá em Relatórios para exportar CSV/PDF e ver detalhes por categoria.</p>
    </div>
  )
}
function KpiCard({ titulo, valor, cor, bg }) {
  return <div className={`rounded-2xl shadow border border-slate-100 p-5 w-full overflow-hidden ${bg}`}>
    <p className="text-sm font-extrabold text-slate-600 tracking-tight">{titulo}</p>
    <p className={`text-2xl font-extrabold ${cor} mt-1`}>R$ {Number(valor||0).toFixed(2)}</p>
  </div>
}
