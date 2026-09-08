import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function BemVindo(){
  const logado = !!localStorage.getItem('token');
  const [fechado, setFechado] = useState(false);
  const handleSair = () => {
    try { window.close(); } catch {}
    setTimeout(() => {
      if (!window.closed) {
        // fallback: tenta fechar via history ou mostra tela fechada
        setFechado(true);
        // tenta também navegar para blank para simular fechar
        setTimeout(() => { try { window.location.href = 'about:blank'; } catch {} }, 500);
      }
    }, 300);
  };
  if (fechado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-8 text-center">
        <div>
          <p className="text-5xl mb-4">👋</p>
          <h1 className="text-2xl font-bold">App fechado</h1>
          <p className="text-slate-400 text-sm mt-2">Pode fechar esta janela ou aba.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8 -m-4">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white p-8 md:p-12 rounded-b-[2.5rem] shadow-xl relative">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Bem-vindo ao <span className="text-yellow-200">AppGastos</span></h1>
              <p className="text-indigo-100 mt-3 text-lg">Seu controle financeiro pessoal, rápido e offline. Gastos, receitas, cartão e investimentos em um só lugar — no notebook e no celular.</p>
            </div>
            <div className="w-64 h-64 bg-white rounded-[2rem] shadow-2xl p-6 hidden md:flex flex-col justify-between">
              <div>
                <p className="text-slate-400 text-xs">Saldo do mês</p><p className="text-2xl font-extrabold text-indigo-600">R$ 2.100,00</p>
                <div className="flex gap-2 mt-3 text-xs"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Receitas 5.200</span><span className="bg-red-100 text-red-700 px-2 py-1 rounded-full">Despesas 3.100</span></div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between bg-slate-50 p-2 rounded-lg"><span>🍔 Alimentação</span><b>R$ 800</b></div>
                <div className="flex justify-between bg-slate-50 p-2 rounded-lg"><span>🚗 Transporte</span><b>R$ 400</b></div>
                <div className="flex justify-between bg-slate-50 p-2 rounded-lg"><span>🏠 Moradia</span><b>R$ 1.200</b></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 space-y-8 w-full overflow-hidden">
        {/* O que faz */}
        <section className="grid md:grid-cols-3 gap-4 w-full">
          <Feature icon="📊" title="Dashboard inteligente" desc="Receitas, despesas e saldo em tempo real, pizza por categoria e evolução 6 meses." />
          <Feature icon="💳" title="Cartão e Receitas" desc="Separe por Receitas, Despesas e Cartão. Cada lançamento com categoria e conta." />
          <Feature icon="📴" title="Offline + Nuvem" desc="PWA Offline • Nuvem Atlas • Backup automático. Sem internet? Salva local e sincroniza quando voltar." />
        </section>

        {/* Dicas */}
        <section className="bg-white rounded-2xl shadow border border-slate-100 p-5 w-full overflow-hidden">
          <h2 className="text-xl font-extrabold text-slate-800">💡 Dicas para usar bem</h2>
          <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm">
            <Tip n="1" t="Registre na hora" d="Lance a despesa assim que pagar. O PWA offline salva mesmo sem sinal." />
            <Tip n="2" t="Categorize sempre" d="Use Alimentação, Transporte, Moradia... Gráficos ficam precisos." />
            <Tip n="3" t="Separe o Cartão" d="Lance gastos do cartão em Cartão para acompanhar fatura." />
            <Tip n="4" t="Revise nos Relatórios" d="Filtre por mês, exporte CSV para Excel e PDF para compartilhar." />
          </div>
        </section>

        {/* Sugestões */}
        <section className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 w-full overflow-hidden">
          <h2 className="text-xl font-extrabold text-amber-900">🚀 Sugestões para evoluir suas finanças</h2>
          <ul className="grid md:grid-cols-2 gap-3 mt-3 text-sm text-amber-900">
            <li className="bg-white p-3 rounded-xl">🎯 <b>Defina meta mensal:</b> ex: gastar até R$ 3.000 em despesas.</li>
            <li className="bg-white p-3 rounded-xl">📈 <b>Acompanhe investimentos:</b> cadastre aportes em Investimentos.</li>
            <li className="bg-white p-3 rounded-xl">🔔 <b>Use o Cartão com limite:</b> anote limite e evite estouro.</li>
            <li className="bg-white p-3 rounded-xl">💾 <b>Backup semanal:</b> Relatórios → Exportar JSON → salve no Drive.</li>
          </ul>
        </section>

        <div className="text-center pb-8 space-y-3">
          <Link to={logado? "/dashboard" : "/login"} className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:opacity-90">Acessar AppGastos →</Link>
          <div><button onClick={handleSair} className="inline-block text-sm text-slate-500 border border-slate-200 px-6 py-2 rounded-xl hover:bg-slate-50">Sair</button></div>
        </div>
      </div>
    </div>
  )
}
function Feature({icon, title, desc}){ return <div className="bg-white p-5 rounded-2xl shadow border border-slate-100 w-full overflow-hidden"><div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl">{icon}</div><h3 className="font-extrabold mt-3 text-slate-800">{title}</h3><p className="text-sm text-slate-500">{desc}</p></div> }
function Tip({n,t,d}){ return <div className="flex gap-3 bg-slate-50 p-3 rounded-xl"><div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">{n}</div><div><p className="font-bold">{t}</p><p className="text-slate-500">{d}</p></div></div> }
