import { useEffect, useState } from 'react';
import api from '../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, LabelList, CartesianGrid } from 'recharts';
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
      try { const c = await api.get('/cartoes'); setCartoes(c.data); } catch {}
    } catch {
      try {
        const r = await api.get('/mock/resumo');
        setData({ ...r.data, evolucao: [] });
      } catch (e) { setErro(e.message); }
    } finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const [periodo, setPeriodo] = useState('6');
  const [cartoes, setCartoes] = useState([]);
  const anos = [hoje.getFullYear()-2, hoje.getFullYear()-1, hoje.getFullYear(), hoje.getFullYear()+1];

  if (loading) return <p>Carregando...</p>;
  if (erro) return <p className="text-red-600">Erro: {erro}</p>;
  if (!data) return null;

  return (
    <div className="space-y-2 w-full max-w-6xl mx-auto overflow-hidden">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1">
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
        <KpiCard titulo={`Saldo ${mes}/${ano}`} valor={data.saldo} cor={data.saldo >= 0 ? 'text-emerald-600' : 'text-red-600'} bg={data.saldo>=0?'bg-emerald-50':'bg-red-50'} />
      </Grid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 w-full">
        <CardPadrao>
          <TituloCard>Receitas {mes}/{ano}</TituloCard>
          {data.porCategoriaReceita?.length ? (
            <div className="w-full overflow-hidden">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={data.porCategoriaReceita} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ cx, cy, midAngle, outerRadius, percent, index })=>{
                    const r = outerRadius + 8;
                    const RAD = Math.PI/180;
                    const x = cx + r * Math.cos(-midAngle*RAD);
                    const y = cy + r * Math.sin(-midAngle*RAD);
                    return percent>0.03 ? (
                      <g>
                        <rect x={x-6} y={y-6} width="8" height="8" fill={COLORS[index % COLORS.length]} />
                        <text x={x+4} y={y} fill="#334155" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight="700">{`${(percent*100).toFixed(0)}%`}</text>
                      </g>
                    ) : null;
                  }}>
                    {data.porCategoriaReceita.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v=>`R$ ${Number(v).toFixed(2)}`} />
                  <Legend wrapperStyle={{fontSize:12}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-slate-500 text-sm">Sem receitas no período.</p>}
        </CardPadrao>
        <CardPadrao>
          <TituloCard>Despesas {mes}/{ano}</TituloCard>
          {data.porCategoria?.length ? (
            <div className="w-full overflow-hidden">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={data.porCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ cx, cy, midAngle, outerRadius, percent, index })=>{
                    const r = outerRadius + 8;
                    const RAD = Math.PI/180;
                    const x = cx + r * Math.cos(-midAngle*RAD);
                    const y = cy + r * Math.sin(-midAngle*RAD);
                    return percent>0.03 ? (
                      <g>
                        <rect x={x-6} y={y-6} width="8" height="8" fill={COLORS[index % COLORS.length]} />
                        <text x={x+4} y={y} fill="#334155" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight="700">{`${(percent*100).toFixed(0)}%`}</text>
                      </g>
                    ) : null;
                  }}>
                    {data.porCategoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v=>`R$ ${Number(v).toFixed(2)}`} />
                  <Legend wrapperStyle={{fontSize:12}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-slate-500 text-sm">Sem despesas no período.</p>}
        </CardPadrao>
      </div>
      <CardPadrao>
        <TituloCard>Receitas x Despesas x Saldo ({mes}/{ano})</TituloCard>
        <div className="w-full overflow-hidden">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={[{ name: ' ', receitas: data.receitas, despesas: data.despesas, saldo: data.saldo }]} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{fontSize:12}} />
              <YAxis tick={{fontSize:12}} width={60} />
              <Legend />
              <Bar dataKey="receitas" fill="#10b981" name="Receitas" radius={[8,8,0,0]} barSize={80}>
                <LabelList dataKey="receitas" position="insideTop" fill="#fff" fontSize={12} fontWeight="bold" formatter={v=> v? `R$ ${Number(v).toFixed(0)}` : ''} />
              </Bar>
              <Bar dataKey="despesas" fill="#ef4444" name="Despesas" radius={[8,8,0,0]} barSize={80}>
                <LabelList dataKey="despesas" position="insideTop" fill="#fff" fontSize={12} fontWeight="bold" formatter={v=> v? `R$ ${Number(v).toFixed(0)}` : ''} />
              </Bar>
              <Bar dataKey="saldo" fill="#4f46e5" name="Saldo" radius={[8,8,0,0]} barSize={80}>
                <LabelList dataKey="saldo" position="insideTop" fill="#fff" fontSize={12} fontWeight="bold" formatter={v=> v!==0? `R$ ${Number(v).toFixed(0)}` : ''} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardPadrao>
      {cartoes.length>0 && (
        <CardPadrao>
          <TituloCard>Cartões — Fatura vs Disponível vs Futuras</TituloCard>
          <div className="w-full overflow-hidden">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={cartoes.map(c=>({ name: c.nome, fatura: c.faturaAtual||0, disponivel: c.limiteDisponivel||0, futuras: c.faturasFuturas||0 }))} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fontSize:12}} />
                <YAxis tick={{fontSize:12}} width={60} />
                <Legend />
                <Bar dataKey="fatura" fill="#f59e0b" name="Fatura Atual" radius={[8,8,0,0]} barSize={30}>
                  <LabelList dataKey="fatura" position="insideTop" fill="#fff" fontSize={11} fontWeight="bold" formatter={v=> v ? `R$ ${v}` : ''} />
                </Bar>
                <Bar dataKey="disponivel" fill="#10b981" name="Disponível" radius={[8,8,0,0]} barSize={30}>
                  <LabelList dataKey="disponivel" position="insideTop" fill="#fff" fontSize={11} fontWeight="bold" formatter={v=> v ? `R$ ${v}` : ''} />
                </Bar>
                <Bar dataKey="futuras" fill="#ef4444" name="Futuras" radius={[8,8,0,0]} barSize={30}>
                  <LabelList dataKey="futuras" position="insideTop" fill="#fff" fontSize={11} fontWeight="bold" formatter={v=> v ? `R$ ${v}` : ''} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center"><p className="text-xs font-extrabold text-emerald-700">Faturas</p><p className="font-bold text-emerald-700">R$ {cartoes.reduce((s,c)=>s+(c.faturaAtual||0),0).toFixed(2)}</p></div>
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-center"><p className="text-xs font-extrabold text-violet-700">Disponível</p><p className="font-bold text-violet-700">R$ {cartoes.reduce((s,c)=>s+(c.limiteDisponivel||0),0).toFixed(2)}</p></div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center"><p className="text-xs font-extrabold text-amber-700">Futuras</p><p className="font-bold text-amber-700">R$ {cartoes.reduce((s,c)=>s+(c.faturasFuturas||0),0).toFixed(2)}</p></div>
          </div>
        </CardPadrao>
      )}
      {/* Evolução por último */}
      {data.evolucao?.length > 0 && (
        <CardPadrao>
          <div className="flex justify-between items-center mb-3">
            <TituloCard>Evolução {periodo==='atual'?'• Mês atual': periodo==='3'?'• 3 meses': periodo==='6'?'• 6 meses':'• Ano'}</TituloCard>
            <select value={periodo} onChange={e=>setPeriodo(e.target.value)} className="border border-slate-200 p-2 rounded-xl text-sm">
              <option value="atual">Mês atual</option>
              <option value="3">3 meses</option>
              <option value="6">6 meses</option>
              <option value="12">Ano</option>
            </select>
          </div>
          <div className="w-full overflow-hidden">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={(() => {
                const n = periodo === 'atual' ? 1 : periodo === '3' ? 3 : periodo === '6' ? 6 : 12;
                return data.evolucao.slice(-n);
              })()}>
                <XAxis dataKey="mes" tick={{fontSize:12}} />
                <YAxis tick={{fontSize:12}} width={60} />
                <Legend />
                <Line type="monotone" dataKey="receitas" stroke="#10b981" strokeWidth={2} dot={{r:5}} label={({x,y,value})=> value ? <text x={x} y={y-10} fill="#10b981" fontSize={11} fontWeight="700" textAnchor="middle">{value}</text> : null} />
                <Line type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={2} dot={{r:5}} label={({x,y,value})=> value ? <text x={x} y={y-10} fill="#ef4444" fontSize={11} fontWeight="700" textAnchor="middle">{value}</text> : null} />
                <Line type="monotone" dataKey="saldo" stroke="#4f46e5" strokeWidth={2} strokeDasharray="5 5" dot={{r:5}} label={({x,y,value})=> value ? <text x={x} y={y-10} fill="#4f46e5" fontSize={11} fontWeight="700" textAnchor="middle">{value}</text> : null} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardPadrao>
      )}
      <p className="text-sm text-slate-500">💡 Dica: Vá em Relatórios para exportar CSV/PDF e ver detalhes por categoria.</p>
    </div>
  )
}
function KpiCard({ titulo, valor, cor, bg }) {
  return <div className={`rounded-2xl shadow border border-slate-100 p-5 w-full overflow-hidden ${bg}`}>
    <p className="text-lg font-extrabold text-slate-700 tracking-tight">{titulo}</p>
    <p className={`text-2xl font-extrabold ${cor} mt-1`}>R$ {Number(valor||0).toFixed(2)}</p>
  </div>
}
